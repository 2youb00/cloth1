const express = require("express")
const router = express.Router()
const SiteSettings = require("../models/SiteSettings")
const adminAuth = require("../middleware/adminAuth")
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { cloudinary } = require("../config/cloudinary")

// Define Cloudinary storage directly in this file to avoid conflicts
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
})

const upload = multer({ storage })

router.get("/", async (req, res) => {
  try {
    let settings = await SiteSettings.findOne()
    if (!settings) {
      settings = new SiteSettings({
        siteName: "Vintage Shop",
        heroImageDesktop: "/placeholder.svg?height=400&width=800",
        heroImageMobile: "/placeholder.svg?height=600&width=400",
        heroTitle: "Welcome to our Vintage Shop",
        heroSubtitle: "Discover timeless fashion pieces",
        categories: ["Shirts", "Pants", "Accessories"],
        footerText: "Find unique vintage clothing",
        contactEmail: "contact@vintageshop.com",
        contactPhone: "123-456-7890",
        socialLinks: { facebook: "https://facebook.com", instagram: "https://instagram.com" },
      })
      await settings.save()
    }
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put(
  "/",
  adminAuth,
  upload.fields([
    { name: "heroImageDesktop", maxCount: 1 },
    { name: "heroImageMobile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("=== UPLOAD DEBUG ===")
      console.log("Files received:", req.files)
      console.log("Body received:", req.body)

      const settings = (await SiteSettings.findOne()) || new SiteSettings()

      Object.assign(settings, {
        siteName: req.body.siteName,
        heroTitle: req.body.heroTitle,
        heroSubtitle: req.body.heroSubtitle,
        footerText: req.body.footerText,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        categories: JSON.parse(req.body.categories),
        socialLinks: JSON.parse(req.body.socialLinks),
      })

      if (req.files?.heroImageDesktop) {
        console.log("Desktop image file object:", req.files.heroImageDesktop[0])
        console.log("Desktop image path:", req.files.heroImageDesktop[0].path)
        settings.heroImageDesktop = req.files.heroImageDesktop[0].path
      }
      if (req.files?.heroImageMobile) {
        console.log("Mobile image file object:", req.files.heroImageMobile[0])
        console.log("Mobile image path:", req.files.heroImageMobile[0].path)
        settings.heroImageMobile = req.files.heroImageMobile[0].path
      }

      console.log("Settings before save:", settings)
      await settings.save()
      console.log("=== END DEBUG ===")

      res.json(settings)
    } catch (error) {
      console.error("Error updating settings:", error)
      res.status(400).json({ message: error.message })
    }
  },
)

module.exports = router
