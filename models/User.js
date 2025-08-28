const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    name: String,
    image: String,
    oldPrice: String,
    newPrice: String,
    label: String,
    quantity: { type: Number, default: 1 },
}, { _id: true });

// Address schema
const addressSchema = new mongoose.Schema({
    label: { type: String, required: true },
    house: { type: String, required: true },
    floor: { type: String },
    address: { type: String, required: true },
    landmark: { type: String },
    phone: { type: String },
   location: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true, lowercase: true },

    cart: [cartItemSchema],

    totalItems: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },

    addresses: [addressSchema]   // ✅ NEW FIELD
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

