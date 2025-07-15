"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { X, Plus } from "lucide-react"

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    categories: [],
    images: [],
    sizes: [],
    colors: [],
    inStock: true,
    featured: false,
  })
  const [newCategory, setNewCategory] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http")) return imagePath
    return `https://cloth1-1.onrender.com${imagePath}`
  }

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`https://cloth1-1.onrender.com/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setProduct(response.data)
      setExistingImages(response.data.images || [])
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching product:", error)
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setImageFiles((prev) => [...prev, ...selectedFiles])

      const newPreviews = selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }))
      setImagePreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeImagePreview = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCategoryAdd = () => {
    if (newCategory && !product.categories.includes(newCategory)) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        categories: [...prevProduct.categories, newCategory],
      }))
      setNewCategory("")
    }
  }

  const handleCategoryRemove = (categoryToRemove) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      categories: prevProduct.categories.filter((category) => category !== categoryToRemove),
    }))
  }

  const handleSizeAdd = () => {
    if (newSize && !product.sizes.includes(newSize)) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        sizes: [...prevProduct.sizes, newSize],
      }))
      setNewSize("")
    }
  }

  const handleSizeRemove = (sizeToRemove) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      sizes: prevProduct.sizes.filter((size) => size !== sizeToRemove),
    }))
  }

  const handleColorAdd = () => {
    if (newColor && !product.colors.includes(newColor)) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        colors: [...prevProduct.colors, newColor],
      }))
      setNewColor("")
    }
  }

  const handleColorRemove = (colorToRemove) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      colors: prevProduct.colors.filter((color) => color !== colorToRemove),
    }))
  }

  const calculateSavings = () => {
    if (product.price && product.salePrice && product.salePrice < product.price) {
      const savings = product.price - product.salePrice
      const percentage = Math.round((savings / product.price) * 100)
      return { savings: savings.toFixed(2), percentage }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("name", product.name)
      formData.append("description", product.description)
      formData.append("price", product.price)
      formData.append("salePrice", product.salePrice || "")
      formData.append("categories", JSON.stringify(product.categories))
      formData.append("sizes", JSON.stringify(product.sizes))
      formData.append("colors", JSON.stringify(product.colors))
      formData.append("inStock", product.inStock)
      formData.append("featured", product.featured)

      formData.append("existingImages", JSON.stringify(existingImages))

      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      const url = id ? `https://cloth1-1.onrender.com/api/products/${id}` : "https://cloth1-1.onrender.com/api/products"
      const method = id ? "patch" : "post"
      await axios({
        method,
        url,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setIsLoading(false)
      navigate("/admin/products")
    } catch (error) {
      console.error("Error saving product:", error)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{id ? "Edit Product" : "Add New Product"}</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price (DZD) *</label>
                <input
                  type="number"
                  name="price"
                  value={product.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Sale Price Section */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Sale Price (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price (DZD)</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={product.salePrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Leave empty for no sale"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be less than regular price</p>
                </div>

                {calculateSavings() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Savings</label>
                    <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                      <div className="text-sm text-green-800">
                        <div>Save: DZD {calculateSavings().savings}</div>
                        <div>Discount: {calculateSavings().percentage}% off</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.categories.map((category, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={() => handleCategoryRemove(category)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleCategoryAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add
                </button>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(image) || "/placeholder.svg"}
                          alt={`Product ${index}`}
                          className="h-24 w-full object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url || "/placeholder.svg"}
                          alt={`Preview ${index}`}
                          className="h-24 w-full object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImagePreview(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <label className="cursor-pointer">
                  <div className="space-y-2">
                    <Plus className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <span className="text-blue-600 font-medium">Upload images</span> or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            {/* Sizes and Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.sizes.map((size, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm flex items-center">
                      {size}
                      <button
                        type="button"
                        onClick={() => handleSizeRemove(size)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="Add a size"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSizeAdd}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.colors.map((color, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm flex items-center">
                      {color}
                      <button
                        type="button"
                        onClick={() => handleColorRemove(color)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add a color"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleColorAdd}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Product Status</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={product.inStock}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={product.featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">Featured Product</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {id ? "Updating..." : "Adding..."}
                  </div>
                ) : id ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
