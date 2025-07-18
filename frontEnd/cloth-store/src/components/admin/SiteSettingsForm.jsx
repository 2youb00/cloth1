"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Save, Upload, Plus, Trash2, Settings, Mail, Globe } from "lucide-react"

export default function SiteSettingsForm() {
  const [settings, setSettings] = useState({
    siteName: "",
    heroImageDesktop: "",
    heroImageMobile: "",
    heroTitle: "",
    heroSubtitle: "",
    categories: [],
    footerText: "",
    contactEmail: "",
    contactPhone: "",
    socialLinks: { facebook: "", instagram: "" },
    emailNotifications: {
      enabled: false,
      adminEmail: "",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
    },
  })
  const [loading, setLoading] = useState(true)
  const [desktopImageFile, setDesktopImageFile] = useState(null)
  const [mobileImageFile, setMobileImageFile] = useState(null)
  const [desktopImagePreview, setDesktopImagePreview] = useState("")
  const [mobileImagePreview, setMobileImagePreview] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get("https://cloth1-1.onrender.com/api/site-settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      })

      const settingsData = {
        ...response.data,
        emailNotifications: response.data.emailNotifications || {
          enabled: false,
          adminEmail: "",
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPassword: "",
        },
      }

      setSettings(settingsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching settings:", error)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }))
  }

  const handleEmailNotificationChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [name]: type === "checkbox" ? checked : value,
      },
    }))
  }

  const handleCategoryChange = (e, index) => {
    const newCategories = [...settings.categories]
    newCategories[index] = e.target.value
    setSettings((prev) => ({ ...prev, categories: newCategories }))
  }

  const addCategory = () => setSettings((prev) => ({ ...prev, categories: [...prev.categories, ""] }))
  const removeCategory = (index) =>
    setSettings((prev) => ({ ...prev, categories: prev.categories.filter((_, i) => i !== index) }))

  const handleDesktopImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDesktopImageFile(file)
      setDesktopImagePreview(URL.createObjectURL(file))
    }
  }

  const handleMobileImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMobileImageFile(file)
      setMobileImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)

    try {
      const formData = new FormData()

      // Add all text fields
      formData.append("siteName", settings.siteName)
      formData.append("heroTitle", settings.heroTitle)
      formData.append("heroSubtitle", settings.heroSubtitle)
      formData.append("footerText", settings.footerText)
      formData.append("contactEmail", settings.contactEmail)
      formData.append("contactPhone", settings.contactPhone)
      formData.append("categories", JSON.stringify(settings.categories))
      formData.append("socialLinks", JSON.stringify(settings.socialLinks))

      // Add email notifications as a JSON string
      formData.append("emailNotifications", JSON.stringify(settings.emailNotifications))

      // Add image files
      if (desktopImageFile) {
        formData.append("heroImageDesktop", desktopImageFile)
      }
      if (mobileImageFile) {
        formData.append("heroImageMobile", mobileImageFile)
      }

      const response = await axios.put("https://cloth1-1.onrender.com/api/site-settings", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setSettings(response.data)
      setDesktopImagePreview("")
      setMobileImagePreview("")
      setDesktopImageFile(null)
      setMobileImageFile(null)
      alert("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      alert("Failed to update settings: " + (error.response?.data?.message || error.message))
    } finally {
      setIsUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: "general", name: "General", icon: Globe },
    { id: "contact", name: "Contact", icon: Settings },
    { id: "notifications", name: "Email Notifications", icon: Mail },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-600 mt-1">Manage your website configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Name *</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter your site name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text *</label>
                  <input
                    type="text"
                    name="footerText"
                    value={settings.footerText}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter footer text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title *</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={settings.heroTitle}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter hero title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle *</label>
                  <input
                    type="text"
                    name="heroSubtitle"
                    value={settings.heroSubtitle}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter hero subtitle"
                  />
                </div>
              </div>

              {/* Hero Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image (Desktop)</label>
                  {settings.heroImageDesktop && !desktopImagePreview && (
                    <img
                      src={settings.heroImageDesktop || "/placeholder.svg"}
                      className="h-32 w-full object-cover rounded-lg border border-gray-300 mb-3"
                      alt="Desktop hero"
                    />
                  )}
                  {desktopImagePreview && (
                    <img
                      src={desktopImagePreview || "/placeholder.svg"}
                      className="h-32 w-full object-cover rounded-lg border border-gray-300 mb-3"
                      alt="Desktop preview"
                    />
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleDesktopImageChange}
                      accept="image/*"
                      className="hidden"
                      id="desktop-image"
                    />
                    <label
                      htmlFor="desktop-image"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-gray-600">Upload Desktop Image</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image (Mobile)</label>
                  {settings.heroImageMobile && !mobileImagePreview && (
                    <img
                      src={settings.heroImageMobile || "/placeholder.svg"}
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 mb-3"
                      alt="Mobile hero"
                    />
                  )}
                  {mobileImagePreview && (
                    <img
                      src={mobileImagePreview || "/placeholder.svg"}
                      className="h-32 w-32 object-cover rounded-lg border border-gray-300 mb-3"
                      alt="Mobile preview"
                    />
                  )}
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleMobileImageChange}
                      accept="image/*"
                      className="hidden"
                      id="mobile-image"
                    />
                    <label
                      htmlFor="mobile-image"
                      className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="text-gray-600">Upload Mobile Image</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Categories</label>
                <div className="space-y-3">
                  {settings.categories.map((category, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => handleCategoryChange(e, index)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Category name"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Link</label>
                  <input
                    type="url"
                    name="facebook"
                    value={settings.socialLinks.facebook}
                    onChange={handleSocialLinkChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram Link</label>
                  <input
                    type="url"
                    name="instagram"
                    value={settings.socialLinks.instagram}
                    onChange={handleSocialLinkChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Email Notification Settings</h3>
                <p className="text-blue-700 text-sm">
                  Configure email notifications to receive alerts when new orders are placed.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="enabled"
                  checked={settings.emailNotifications?.enabled || false}
                  onChange={handleEmailNotificationChange}
                  className="h-5 w-5 text-blue-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Enable email notifications for new orders
                </label>
              </div>

              {settings.emailNotifications?.enabled && (
                <div className="space-y-6 pl-8 border-l-4 border-indigo-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email *</label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={settings.emailNotifications?.adminEmail || ""}
                      onChange={handleEmailNotificationChange}
                      required={settings.emailNotifications?.enabled}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="admin@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address to receive order notifications</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host *</label>
                      <input
                        type="text"
                        name="smtpHost"
                        value={settings.emailNotifications?.smtpHost || ""}
                        onChange={handleEmailNotificationChange}
                        required={settings.emailNotifications?.enabled}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port *</label>
                      <input
                        type="number"
                        name="smtpPort"
                        value={settings.emailNotifications?.smtpPort || 587}
                        onChange={handleEmailNotificationChange}
                        required={settings.emailNotifications?.enabled}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username *</label>
                      <input
                        type="text"
                        name="smtpUser"
                        value={settings.emailNotifications?.smtpUser || ""}
                        onChange={handleEmailNotificationChange}
                        required={settings.emailNotifications?.enabled}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password *</label>
                      <input
                        type="password"
                        name="smtpPassword"
                        value={settings.emailNotifications?.smtpPassword || ""}
                        onChange={handleEmailNotificationChange}
                        required={settings.emailNotifications?.enabled}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use app password for Gmail</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-8 border-t border-gray-200">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 disabled:bg-gray-400 transition-all flex items-center justify-center"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
