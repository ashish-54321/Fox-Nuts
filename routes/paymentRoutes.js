const express = require("express");
const router = express.Router();
const { createPayment, verifyPayment } = require("../controllers/paymentController");

router.post("/create", createPayment);   // Create order
router.post("/verify", verifyPayment);   // Verify after success

module.exports = router;
