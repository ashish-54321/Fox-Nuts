const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

// POST: save user address
router.post("/save", addressController.saveAddress);
router.put("/update", addressController.updateAddress);
router.get("/:userId", addressController.getAddresses);
router.delete("/delete", addressController.deleteAddress);

module.exports = router;
