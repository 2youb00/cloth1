const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get all products (unchanged)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query;
    const query = {};
    
    if (category) query.categories = category;
    if (search) query.$text = { $search: search };

    const sortOptions = {};
    if (sort === 'price_asc') sortOptions.price = 1;
    if (sort === 'price_desc') sortOptions.price = -1;
    if (sort === 'newest') sortOptions.createdAt = -1;

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single product (unchanged)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product (admin only)
router.post('/', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, categories, sizes, colors, inStock, featured } = req.body;
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const product = new Product({
      name,
      description,
      price,
      categories: JSON.parse(categories),
      images,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      inStock: inStock === 'true',
      featured: featured === 'true'
    });

    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update a product (admin only)
router.patch('/:id', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, categories, sizes, colors, inStock, featured } = req.body;
    const updateData = {
      name,
      description,
      price,
      categories: JSON.parse(categories),
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      inStock: inStock === 'true',
      featured: featured === 'true'
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Delete associated image files
    product.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '..', imagePath);
      fs.unlink(fullPath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;