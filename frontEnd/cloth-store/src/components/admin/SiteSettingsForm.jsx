"use client"

import { useState, useEffect } from "react"
import axios from "axios"

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
  })
  const [loading, setLoading] = useState(true)
  const [desktopImageFile, setDesktopImageFile] = useState(null)
  const [mobileImageFile, setMobileImageFile] = useState(null)
  const [desktopImagePreview, setDesktopImagePreview] = useState("")
  const [mobileImagePreview, setMobileImagePreview] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    axios
      .get("https://cloth1-1.onrender.com/api/site-settings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
      })
      .then((res) => {
        setSettings(res.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }))
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

      // Add text fields
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== "heroImageDesktop" && key !== "heroImageMobile") {
          formData.append(key, typeof value === "object" ? JSON.stringify(value) : value)
        }
      })

      // Add image files
      if (desktopImageFile) {
        formData.append("heroImageDesktop", desktopImageFile)
      } else {
        formData.append("heroImageDesktop", settings.heroImageDesktop || "")
      }

      if (mobileImageFile) {
        formData.append("heroImageMobile", mobileImageFile)
      } else {
        formData.append("heroImageMobile", settings.heroImageMobile || "")
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

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        type="text"
        name="siteName"
        value={settings.siteName}
        onChange={handleChange}
        placeholder="Site Name"
        className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
        required
      />

      <div>
        <label>Hero Image (Desktop)</label>
        {(settings.heroImageDesktop && !desktopImagePreview && (
          <img
            src={settings.heroImageDesktop || "/placeholder.svg"}
            className="h-32 w-64 object-cover rounded border"
            alt="Desktop hero"
          />
        )) ||
          (desktopImagePreview && (
            <img
              src={desktopImagePreview || "/placeholder.svg"}
              className="h-32 w-64 object-cover rounded border"
              alt="Desktop preview"
            />
          ))}
        <input type="file" onChange={handleDesktopImageChange} accept="image/*" className="block w-full px-2 py-2" />
      </div>

      <div>
        <label>Hero Image (Mobile)</label>
        {(settings.heroImageMobile && !mobileImagePreview && (
          <img
            src={settings.heroImageMobile || "/placeholder.svg"}
            className="h-32 w-32 object-cover rounded border"
            alt="Mobile hero"
          />
        )) ||
          (mobileImagePreview && (
            <img
              src={mobileImagePreview || "/placeholder.svg"}
              className="h-32 w-32 object-cover rounded border"
              alt="Mobile preview"
            />
          ))}
        <input type="file" onChange={handleMobileImageChange} accept="image/*" className="block w-full px-2 py-2" />
      </div>

      <input
        type="text"
        name="heroTitle"
        value={settings.heroTitle}
        onChange={handleChange}
        placeholder="Hero Title"
        className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
        required
      />

      <input
        type="text"
        name="heroSubtitle"
        value={settings.heroSubtitle}
        onChange={handleChange}
        placeholder="Hero Subtitle"
        className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
        required
      />

      <div>
        <label>Categories</label>
        {settings.categories.map((category, index) => (
          <div key={index} className="flex mt-1">
            <input
              type="text"
              value={category}
              onChange={(e) => handleCategoryChange(e, index)}
              className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
              required
            />
            <button
              type="button"
              onClick={() => removeCategory(index)}
              className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addCategory} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">
          Add Category
        </button>
      </div>
      <div className="felx flex-row space-y-4">
        <label>Footer</label>
        <input
          type="text"
          name="footerText"
          value={settings.footerText}
          onChange={handleChange}
          placeholder="Footer Text"
          className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
          required
        />

        <input
          type="email"
          name="contactEmail"
          value={settings.contactEmail}
          onChange={handleChange}
          placeholder="Contact Email"
          className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
          required
        />

        <input
          type="tel"
          name="contactPhone"
          value={settings.contactPhone}
          onChange={handleChange}
          placeholder="Contact Phone"
          className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
          required
        />

        <input
          type="url"
          name="facebook"
          value={settings.socialLinks.facebook}
          onChange={handleSocialLinkChange}
          placeholder="Facebook Link"
          className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
        />

        <input
          type="url"
          name="instagram"
          value={settings.socialLinks.instagram}
          onChange={handleSocialLinkChange}
          placeholder="Instagram Link"
          className="block w-full rounded-md border-gray-300 shadow-sm px-2 py-2"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Save Settings"}
      </button>
    </form>
  )
}
