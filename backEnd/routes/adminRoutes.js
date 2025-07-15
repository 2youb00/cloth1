const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Order = require("../models/Order")
const Product = require("../models/Product")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const adminAuth = require("../middleware/adminAuth")

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user with admin privileges
    const user = await User.findOne({ email, isAdmin: true })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    res.json({ token })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin logout route
router.post("/logout", adminAuth, (req, res) => {
  // Since we're using JWT, logout is handled client-side by removing the token
  res.json({ message: "Logged out successfully" })
})

// Verify admin token
router.get("/verify", adminAuth, (req, res) => {
  res.json({ message: "Admin authenticated", user: req.user })
})

// Enhanced dashboard stats
router.get("/dashboard-stats", adminAuth, async (req, res) => {
  try {
    const { range = "30d" } = req.query

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Basic counts
    const [totalProducts, totalOrders, totalUsers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments(),
    ])

    // Revenue calculation
    const revenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    // Order status counts
    const orderStatusCounts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    const ordersByStatus = {}
    orderStatusCounts.forEach((item) => {
      ordersByStatus[item._id] = item.count
    })

    // Recent orders with proper population
    const recentOrders = await Order.find({ createdAt: { $gte: startDate } })
      .populate("user", "email firstName lastName")
      .populate("products.product", "name")
      .sort({ createdAt: -1 })
      .limit(10)

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Featured products count
    const featuredProducts = await Product.countDocuments({ featured: true })

    // Low stock products (assuming we add a stock field later)
    const lowStockProducts = await Product.find({
      $or: [{ inStock: false }],
    }).limit(10)

    // Calculate conversion rate (mock data - you'd need to track visits)
    const conversionRate = Math.random() * 5 + 2 // Mock 2-7% conversion rate

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalUsers,
      pendingOrders: ordersByStatus.pending || 0,
      processingOrders: ordersByStatus.processing || 0,
      shippedOrders: ordersByStatus.shipped || 0,
      deliveredOrders: ordersByStatus.delivered || 0,
      recentOrders,
      ordersByStatus,
      averageOrderValue,
      featuredProducts,
      lowStockProducts,
      conversionRate,
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: error.message })
  }
})

// Get individual order details for admin
router.get("/orders/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("products.product")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    console.error("Error fetching order details:", error)
    res.status(500).json({ message: "Error fetching order details" })
  }
})

module.exports = router
