const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    invoiceUrl: { type: String, default: "#" },
    arrivedAt: { type: String, default: "Not Available" },
    cart: { type: Array, required: true }, // cart details
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: "Pay Online" },
    paymentStatus: { type: String, default: "Not Available" },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    deliveryAddress: { type: String, required: true },
    phone: { type: String, required: true },
    alternatePhone: { type: String, default: "Not Available" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
