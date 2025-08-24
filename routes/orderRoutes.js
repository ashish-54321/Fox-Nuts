const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController.js");

// Get all orders by userId
router.get("/user/:userId", orderController.getUserOrders);

module.exports = router;
