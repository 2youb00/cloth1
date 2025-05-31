const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const auth = require('../middleware/auth');
const ShippedOrder = require('../models/ShippedOrder');
const CancelledOrder = require('../models/CancelledOrder');
const bcrypt = require('bcryptjs');

// Get cart count (Move this route to the top)
router.get('/count', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ user: req.user.userId, status: 'pending' });
    if (!order) {
      return res.json({ count: 0 });
    }
    const count = order.products.reduce((total, item) => total + item.quantity, 0);
    res.json({ count });
  } catch (error) {
    console.error('Error in /count route:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new order
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;
    
    // Check if there's an existing pending order for this user
    let order = await Order.findOne({ user: req.user.userId, status: 'pending' });
    
    if (order) {
      // If there's an existing order, update it
      products.forEach(newProduct => {
        const existingProductIndex = order.products.findIndex(
          p => p.product.toString() === newProduct.product
        );
        
        if (existingProductIndex >= 0) {
          // If the product already exists in the order, update the quantity
          order.products[existingProductIndex].quantity += newProduct.quantity;
        } else {
          // If it's a new product, add it to the order
          order.products.push(newProduct);
        }
      });
      
      order.totalAmount += totalAmount;
    } else {
      // If there's no existing order, create a new one
      order = new Order({
        user: req.user.userId,
        products,
        totalAmount,
        shippingAddress,
      });
    }
    
    const updatedOrder = await order.save();
    res.status(201).json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'email').populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId, status: 'pending' }).populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Get a single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.userId }).populate('products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تحديث الكمية في الطلب
router.patch('/', auth,async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId; // من التوكن بعد المصادقة

    // ابحث عن الطلب الذي ينتمي لهذا المستخدم والذي يحتوي على حالة "قيد الانتظار"
    const order = await Order.findOne({ user: userId, status: 'pending' });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // العثور على المنتج المحدد في الطلب وتحديث الكمية
    const productInOrder = order.products.find(
      (product) => product.product.toString() === productId
    );

    if (!productInOrder) {
      return res.status(404).json({ message: 'Product not found in order.' });
    }

    productInOrder.quantity = quantity;

    // حفظ التغييرات في الطلب
    await order.save();

    res.json({ message: 'Product quantity updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product quantity.' });
  }
});

router.delete('/:productId',auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const order = await Order.findOne({ user: userId, status: 'pending' });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.products = order.products.filter(
      (product) => product.product.toString() !== productId
    );

    await order.save();

    res.json({ message: 'Product removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove product.' });
  }
});






// Update order status (admin only)
router.patch('/:id', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status === 'shipped' && order.status !== 'shipped') {
      // Move the order to ShippedOrders
      const shippedOrder = new ShippedOrder({
        originalOrder: order._id,
        trackingNumber: req.body.trackingNumber,
        estimatedDelivery: req.body.estimatedDelivery,
      });
      await shippedOrder.save();
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



router.delete('/delete-order/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ message: 'Order not found.' });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'An error occurred while deleting the order.' });
  }
});


// Cancel order (admin only)
router.post('/:id/cancel', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot cancel shipped or delivered orders' });
    }

    const cancelledOrder = new CancelledOrder({
      originalOrder: order._id,
      reason: req.body.reason || 'No reason provided',
    });

    await cancelledOrder.save();

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', cancelledOrder });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: error.message });
  }
});



// Get all cancelled orders (admin only)
router.get('/get/cancelled', adminAuth, async (req, res) => {
  console.log('Fetching cancelled orders');
  try {
    const cancelledOrders = await CancelledOrder.find().populate({
      path: 'originalOrder',
      populate: { path: 'user', select: 'email' }
    });
    console.log('Cancelled orders:', cancelledOrders);
    res.json(cancelledOrders);
  } catch (error) {
    console.error('Error fetching cancelled orders:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});




module.exports = router;