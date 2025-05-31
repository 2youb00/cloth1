"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

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
  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
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
    const files = [...e.target.files]
    setImageFiles((prev) => [...prev, ...files])

    // Create previews for new files
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
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

  const handleSizeAdd = () => {
    if (newSize && !product.sizes.includes(newSize)) {
      setProduct((prevProduct) => ({
        ...prevProduct,
        sizes: [...prevProduct.sizes, newSize],
      }))
      setNewSize("")
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append("name", product.name)
      formData.append("description", product.description)
      formData.append("price", product.price)
      formData.append("categories", JSON.stringify(product.categories))
      formData.append("sizes", JSON.stringify(product.sizes))
      formData.append("colors", JSON.stringify(product.colors))
      formData.append("inStock", product.inStock)
      formData.append("featured", product.featured)

      imageFiles.forEach((file) => {
        formData.append("images", file)
      })

      const url = id ? `http://localhost:5000/api/products/${id}` : "http://localhost:5000/api/products"
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
      navigate("/admin/products")
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">{id ? "Edit Product" : "Add New Product"}</h1>
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
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categories">
            Categories
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {product.categories.map((category, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                {category}
              </span>
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
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
            Images
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview || "/placeholder.svg"}
                alt={`Preview ${index}`}
                className="h-20 w-20 object-cover rounded border"
              />
            ))}
          </div>
          <div className="flex">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="images"
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => document.getElementById("images").click()}
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sizes">
            Sizes
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {product.sizes.map((size, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                {size}
              </span>
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
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="colors">
            Colors
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {product.colors.map((color, index) => (
              <span key={index} className="bg-gray-200 px-2 py-1 rounded">
                {color}
              </span>
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
              className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input type="checkbox" name="inStock" checked={product.inStock} onChange={handleChange} className="mr-2" />
            <span className="text-gray-700 text-sm font-bold">In Stock</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={product.featured}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-gray-700 text-sm font-bold">Featured</span>
          </label>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            {id ? "Update Product" : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  )
}
