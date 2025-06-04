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

  // Handle both Cloudinary URLs and local paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http")) return imagePath // Cloudinary URL
    return `https://cloth1-1.onrender.com${imagePath}` // Local path
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

      // Generate previews for the new files
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append("name", product.name)
      formData.append("description", product.description)
      formData.append("price", product.price)
      formData.append("categories", JSON.stringify(product.categories))
      formData.append("sizes", JSON.stringify(product.sizes))
      formData.append("colors", JSON.stringify(product.colors))
      formData.append("inStock", product.inStock)
      formData.append("featured", product.featured)

      // Add existing images that weren't removed
      formData.append("existingImages", JSON.stringify(existingImages))

      // Add new image files
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">{id ? "Edit Product" : "Add New Product"}</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="price"
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Categories</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.categories.map((category, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span>{category}</span>
                  <button
                    type="button"
                    onClick={() => handleCategoryRemove(category)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
              />
              <button
                type="button"
                onClick={handleCategoryAdd}
                className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Images Section */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={getImageUrl(image) || "/placeholder.svg"}
                        alt={`Product ${index}`}
                        className="h-32 w-full object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">New Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview.url || "/placeholder.svg"}
                        alt={`Preview ${index}`}
                        className="h-32 w-full object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImagePreview(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Images</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-white border border-gray-300 rounded-md py-2 px-3 flex items-center justify-center text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                  <span>Upload files</span>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    className="sr-only"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <p className="ml-3 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {/* Sizes Section */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Sizes</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.sizes.map((size, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span>{size}</span>
                  <button
                    type="button"
                    onClick={() => handleSizeRemove(size)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="Add a size"
              />
              <button
                type="button"
                onClick={handleSizeAdd}
                className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Colors Section */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Colors</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.colors.map((color, index) => (
                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                  <span>{color}</span>
                  <button
                    type="button"
                    onClick={() => handleColorRemove(color)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                placeholder="Add a color"
              />
              <button
                type="button"
                onClick={handleColorAdd}
                className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                id="inStock"
                type="checkbox"
                name="inStock"
                checked={product.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                In Stock
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="featured"
                type="checkbox"
                name="featured"
                checked={product.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                Featured Product
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {id ? "Updating..." : "Adding..."}
                </>
              ) : id ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
