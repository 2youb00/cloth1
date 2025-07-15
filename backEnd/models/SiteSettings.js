const mongoose = require("mongoose")

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, required: true },
    heroImageDesktop: String,
    heroImageMobile: String,
    heroTitle: { type: String, required: true },
    heroSubtitle: { type: String, required: true },
    categories: [String],
    footerText: String,
    contactEmail: String,
    contactPhone: String,
    socialLinks: {
      facebook: String,
      instagram: String,
    },
    emailNotifications: {
      enabled: { type: Boolean, default: false },
      adminEmail: String,
      smtpHost: String,
      smtpPort: { type: Number, default: 587 },
      smtpUser: String,
      smtpPassword: String,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("SiteSettings", siteSettingsSchema)
