const mongoose = require("mongoose")

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, required: true },
  heroImageDesktop: { type: String, required: true },
  heroImageMobile: { type: String, required: true },
  heroTitle: { type: String, required: true },
  heroSubtitle: { type: String, required: true },
  categories: [{ type: String, required: true }],
  footerText: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, required: true },
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
  },
})

module.exports = mongoose.model("SiteSettings", siteSettingsSchema)
