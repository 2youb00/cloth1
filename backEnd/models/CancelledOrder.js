const mongoose = require('mongoose');

const cancelledOrderSchema = new mongoose.Schema({
  originalOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  cancelledAt: { type: Date, default: Date.now },
  reason: { type: String },
});

module.exports = mongoose.model('CancelledOrder', cancelledOrderSchema);