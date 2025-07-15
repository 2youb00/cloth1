const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      size: String,
      color: String,
    },
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    deliveryType: { type: String, enum: ["office", "home"], required: true },
    wilaya: { type: String, required: true },
    daira: { type: String, required: true },
    homeAddress: String,
    phoneNumber: { type: String, required: true },
    notes: String,
    country: { type: String, default: "Algeria" },
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
  },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Order", orderSchema)
