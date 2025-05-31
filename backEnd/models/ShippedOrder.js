// models/ShippedOrder.js
const mongoose = require('mongoose');

const shippedOrderSchema = new mongoose.Schema({
  originalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  shippedAt: { type: Date, default: Date.now },
  trackingNumber: String,
  estimatedDelivery: Date,
});

module.exports = mongoose.model('ShippedOrder', shippedOrderSchema);