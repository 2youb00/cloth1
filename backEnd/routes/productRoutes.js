const express = require("express")
const router = express.Router()
const Product = require("../models/Product")
const adminAuth = require("../middleware/adminAuth")
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { cloudinary } = require("../config/cloudinary")

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
})

const upload = multer({ storage })

// Get all products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, limit = 20, page = 1 } = req.query
    const query = {}

    if (category) query.categories = category
    if (search) query.$text = { $search: search }

    const sortOptions = {}
    if (sort === "price_asc") sortOptions.price = 1
    if (sort === "price_desc") sortOptions.price = -1
    if (sort === "newest") sortOptions.createdAt = -1
    if (sort === "sale") {
      // Show products with sale prices first
      query.salePrice = { $exists: true, $ne: null }
    }

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Product.countDocuments(query)

    res.json({
      products,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get a single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new product (admin only)
router.post("/", adminAuth, upload.array("images", 10), async (req, res) => {
  try {
    const { name, description, price, salePrice, categories, sizes, colors, inStock, featured } = req.body

    const images = req.files.map((file) => file.path)

    // Validate salePrice
    let validSalePrice = null
    if (salePrice && Number.parseFloat(salePrice) > 0 && Number.parseFloat(salePrice) < Number.parseFloat(price)) {
      validSalePrice = Number.parseFloat(salePrice)
    }

    const product = new Product({
      name,
      description,
      price: Number.parseFloat(price),
      salePrice: validSalePrice,
      categories: JSON.parse(categories),
      images,
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      inStock: inStock === "true",
      featured: featured === "true",
    })

    const newProduct = await product.save()
    res.status(201).json(newProduct)
  } catch (error) {
    console.error("Error creating product:", error)
    res.status(400).json({ message: error.message })
  }
})

// Update a product (admin only)
router.patch("/:id", adminAuth, upload.array("images", 10), async (req, res) => {
  try {
    const { name, description, price, salePrice, categories, sizes, colors, inStock, featured, existingImages } =
      req.body

    const parsedExistingImages = existingImages ? JSON.parse(existingImages) : []
    const newImages = req.files.map((file) => file.path)
    const images = [...parsedExistingImages, ...newImages]

    // Validate salePrice
    let validSalePrice = null
    if (salePrice && Number.parseFloat(salePrice) > 0 && Number.parseFloat(salePrice) < Number.parseFloat(price)) {
      validSalePrice = Number.parseFloat(salePrice)
    }

    const updateData = {
      name,
      description,
      price: Number.parseFloat(price),
      salePrice: validSalePrice,
      categories: JSON.parse(categories),
      sizes: JSON.parse(sizes),
      colors: JSON.parse(colors),
      inStock: inStock === "true",
      featured: featured === "true",
      images,
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!product) return res.status(404).json({ message: "Product not found" })

    res.json(product)
  } catch (error) {
    console.error("Error updating product:", error)
    res.status(400).json({ message: error.message })
  }
})

// Delete a product (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
