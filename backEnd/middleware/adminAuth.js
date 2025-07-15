const jwt = require("jsonwebtoken")
const User = require("../models/User")

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: "Not authorized as admin" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Admin auth error:", error)
    res.status(401).json({ message: "Token is not valid" })
  }
}

module.exports = adminAuth
