import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function SiteSettingsForm() {
  const [settings, setSettings] = useState({
    siteName: '',
    heroImage: '',
    heroTitle: '',
    heroSubtitle: '',
    categories: [],
    footerText: '',
    contactEmail: '',
    contactPhone: '',
    socialLinks: {
      facebook: '',
      instagram: '',
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/site-settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setError('Failed to fetch site settings');
      setLoading(false);
    }
  };
  
  

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSettings(prevSettings => ({
      ...prevSettings,
      socialLinks: {
        ...prevSettings.socialLinks,
        [name]: value
      }
    }))
  }

  const handleCategoryChange = (e, index) => {
    const newCategories = [...settings.categories]
    newCategories[index] = e.target.value
    setSettings(prevSettings => ({
      ...prevSettings,
      categories: newCategories
    }))
  }

  const addCategory = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      categories: [...prevSettings.categories, '']
    }))
  }

  const removeCategory = (index) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      categories: prevSettings.categories.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/site-settings', settings, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      alert('Site settings updated successfully');
    } catch (error) {
      console.error('Error updating site settings:', error);
      setError('Failed to update site settings');
    }
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Site Name</label>
        <input
          type="text"
          id="siteName"
          name="siteName"
          value={settings.siteName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">Hero Image URL</label>
        <input
          type="text"
          id="heroImage"
          name="heroImage"
          value={settings.heroImage}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="heroTitle" className="block text-sm font-medium text-gray-700">Hero Title</label>
        <input
          type="text"
          id="heroTitle"
          name="heroTitle"
          value={settings.heroTitle}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="heroSubtitle" className="block text-sm font-medium text-gray-700">Hero Subtitle</label>
        <input
          type="text"
          id="heroSubtitle"
          name="heroSubtitle"
          value={settings.heroSubtitle}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Categories</label>
        {settings.categories.map((category, index) => (
          <div key={index} className="flex mt-1">
            <input
              type="text"
              value={category}
              onChange={(e) => handleCategoryChange(e, index)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
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
        <button
          type="button"
          onClick={addCategory}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Category
        </button>
      </div>

      <div>
        <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">Footer Text</label>
        <input
          type="text"
          id="footerText"
          name="footerText"
          value={settings.footerText}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={settings.contactEmail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Contact Phone</label>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={settings.contactPhone}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
          required
        />
      </div>

      <div>
        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">Facebook Link</label>
        <input
          type="url"
          id="facebook"
          name="facebook"
          value={settings.socialLinks.facebook}
          onChange={handleSocialLinkChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
        />
      </div>

      <div>
        <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram Link</label>
        <input
          type="url"
          id="instagram"
          name="instagram"
          value={settings.socialLinks.instagram}
          onChange={handleSocialLinkChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-2 py-2"
        />
      </div>

      <div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Settings
        </button>
      </div>
    </form>
  )
}