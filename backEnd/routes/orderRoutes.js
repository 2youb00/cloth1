const express = require("express")
const router = express.Router()
const Order = require("../models/Order")
const adminAuth = require("../middleware/adminAuth")
const User = require("../models/User")
const auth = require("../middleware/auth")
const ShippedOrder = require("../models/ShippedOrder")
const CancelledOrder = require("../models/CancelledOrder")
const emailService = require("../services/emailService")

// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body

    // Validation
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Products are required" })
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Valid total amount is required" })
    }

    if (!shippingAddress || !shippingAddress.phoneNumber || !shippingAddress.wilaya || !shippingAddress.daira) {
      return res.status(400).json({ message: "Complete shipping address is required" })
    }

    if (shippingAddress.deliveryType === "home" && !shippingAddress.homeAddress) {
      return res.status(400).json({ message: "Home address is required for home delivery" })
    }

    const order = new Order({
      user: req.user.userId,
      products,
      totalAmount,
      shippingAddress,
      status: "pending",
    })

    const savedOrder = await order.save()
    const populatedOrder = await Order.findById(savedOrder._id).populate("products.product").populate("user", "email")

    // Send email notification
    try {
      await emailService.sendNewOrderNotification(populatedOrder)
    } catch (emailError) {
      console.error("Email notification failed:", emailError)
      // Don't fail the order creation if email fails
    }

    res.status(201).json(populatedOrder)
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(400).json({ message: error.message })
  }
})

// Get all orders (admin only)
router.get("/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "email").populate("products.product")
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get orders for logged in user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate("products.product")
    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a single order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.userId }).populate("products.product")
    if (!order) return res.status(404).json({ message: "Order not found" })
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update order status (admin only)
router.patch("/:id", adminAuth, async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) return res.status(404).json({ message: "Order not found" })

    if (status === "shipped" && order.status !== "shipped") {
      // Move the order to ShippedOrders
      const shippedOrder = new ShippedOrder({
        originalOrder: order._id,
        trackingNumber: req.body.trackingNumber,
        estimatedDelivery: req.body.estimatedDelivery,
      })
      await shippedOrder.save()
    }

    order.status = status
    await order.save()

    res.json(order)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Cancel order (admin only)
router.post("/:id/cancel", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return res.status(400).json({ message: "Cannot cancel shipped or delivered orders" })
    }

    const cancelledOrder = new CancelledOrder({
      originalOrder: order._id,
      reason: req.body.reason || "No reason provided",
    })

    await cancelledOrder.save()

    order.status = "cancelled"
    await order.save()

    res.json({ message: "Order cancelled successfully", cancelledOrder })
  } catch (error) {
    console.error("Error cancelling order:", error)
    res.status(500).json({ message: error.message })
  }
})

// Delete order (admin only)
router.delete("/delete-order/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found." })
    }

    await Order.findByIdAndDelete(req.params.id)
    res.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    res.status(500).json({ message: "An error occurred while deleting the order." })
  }
})

// Get all cancelled orders (admin only)
router.get("/get/cancelled", adminAuth, async (req, res) => {
  try {
    const cancelledOrders = await CancelledOrder.find().populate({
      path: "originalOrder",
      populate: { path: "user", select: "email" },
    })
    res.json(cancelledOrders)
  } catch (error) {
    console.error("Error fetching cancelled orders:", error)
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
