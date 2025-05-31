const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  categories: [{ type: String, required: true }],
  images: [{ type: String, required: true }],
  sizes: [{ type: String, required: true }],
  colors: [String],
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

productSchema.index({ name: 'text', description: 'text', categories: 'text' });

module.exports = mongoose.model('Product', productSchema);