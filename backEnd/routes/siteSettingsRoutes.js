const express = require("express")
const router = express.Router()
const SiteSettings = require("../models/SiteSettings")
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
        emailNotifications: {
          enabled: false,
          adminEmail: "",
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPassword: "",
        },
      })
      await settings.save()
    }
    res.json({
  siteName: settings.siteName,
  heroImage: settings.heroImage,
  heroTitle: settings.heroTitle,
  heroSubtitle: settings.heroSubtitle,
  categories: settings.categories,
  footerText: settings.footerText,
  contactEmail: settings.contactEmail,
  contactPhone: settings.contactPhone,
  socialLinks: settings.socialLinks,
  heroImageDesktop: settings.heroImageDesktop,
  heroImageMobile: settings.heroImageMobile,
  emailNotifications: {
    enabled: settings.emailNotifications.enabled,
    adminEmail: settings.emailNotifications.adminEmail,
    smtpHost: settings.emailNotifications.smtpHost,
    smtpPort: settings.emailNotifications.smtpPort,
    
  }
})


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
      console.log("=== SITE SETTINGS UPDATE ===")
      console.log("Body received:", req.body)

      const settings = (await SiteSettings.findOne()) || new SiteSettings()

      // Update basic fields
      settings.siteName = req.body.siteName
      settings.heroTitle = req.body.heroTitle
      settings.heroSubtitle = req.body.heroSubtitle
      settings.footerText = req.body.footerText
      settings.contactEmail = req.body.contactEmail
      settings.contactPhone = req.body.contactPhone
      settings.categories = JSON.parse(req.body.categories || "[]")
      settings.socialLinks = JSON.parse(req.body.socialLinks || "{}")

      // Handle email notifications properly
      if (req.body.emailNotifications) {
        const emailNotifications = JSON.parse(req.body.emailNotifications)
        settings.emailNotifications = {
          enabled: emailNotifications.enabled || false,
          adminEmail: emailNotifications.adminEmail || "",
          smtpHost: emailNotifications.smtpHost || "",
          smtpPort: emailNotifications.smtpPort || 587,
          smtpUser: emailNotifications.smtpUser || "",
          smtpPassword: emailNotifications.smtpPassword || "",
        }
      }

      // Handle image uploads
      if (req.files?.heroImageDesktop) {
        settings.heroImageDesktop = req.files.heroImageDesktop[0].path
      }
      if (req.files?.heroImageMobile) {
        settings.heroImageMobile = req.files.heroImageMobile[0].path
      }

      console.log("Settings before save:", settings)
      await settings.save()
      console.log("Settings saved successfully")

      res.json(settings)
    } catch (error) {
      console.error("Error updating settings:", error)
      res.status(400).json({ message: error.message })
    }
  },
)

module.exports = router
