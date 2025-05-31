const express = require("express")
const router = express.Router()
const SiteSettings = require("../models/SiteSettings")
const adminAuth = require("../middleware/adminAuth")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const uploadsDir = path.join(__dirname, "..", "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  }),
})

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

      if (req.files?.heroImageDesktop) settings.heroImageDesktop = `/uploads/${req.files.heroImageDesktop[0].filename}`
      if (req.files?.heroImageMobile) settings.heroImageMobile = `/uploads/${req.files.heroImageMobile[0].filename}`

      await settings.save()
      res.json(settings)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
)

module.exports = router
