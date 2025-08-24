const Order = require("../models/Order");

// ✅ Fetch all orders for a specific user
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "UserId is required" });
        }

        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found for this user" });
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
