const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number, default: null }, // Direct sale price instead of percentage
    categories: [String],
    images: [String],
    sizes: [String],
    colors: [String],
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

// Create text index for search
productSchema.index({ name: "text", description: "text" })

module.exports = mongoose.model("Product", productSchema)
