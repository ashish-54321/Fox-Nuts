// routes/cart.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.post("/update-quantity", cartController.updateQuantity);
router.post("/delete-item", cartController.deleteFromCart);
router.post("/clear-cart", cartController.clearCart);
router.post("/view-cart", cartController.viewCart);

module.exports = router;
