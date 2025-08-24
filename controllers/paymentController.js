const razorpay = require("../config/razorpay");
const User = require("../models/User");
const Order = require("../models/Order");

exports.createPayment = async (req, res) => {
    try {
        const { userId, deliveryAddress, alternatePhone, arrivedAt } = req.body;

        if (!userId || !deliveryAddress) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Get User Cart
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Calculate total with GST (18%)
        let totalAmount = user.totalPrice;
        let gst = (totalAmount * 18) / 100;
        let finalAmount = Math.round(totalAmount + gst);

        // Create Razorpay Order
        const options = {
            amount: finalAmount * 100, // paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save order as pending
        const newOrder = new Order({
            userId,
            name: user.fullName,
            cart: user.cart,
            totalAmount: finalAmount,
            deliveryAddress,
            phone: user.phone,
            alternatePhone,
            arrivedAt,
            razorpayOrderId: razorpayOrder.id,
            paymentStatus: "Pending"
        });

        await newOrder.save();

        res.status(200).json({
            message: "Order created",
            orderId: razorpayOrder.id,
            amount: finalAmount,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID,
            order: newOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Payment error", error });
    }
};


const crypto = require("crypto");

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Signature Verify
        const sign = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpaySignature === expectedSign) {
            // Update Order Status
            const order = await Order.findOne({ razorpayOrderId });
            if (!order) return res.status(404).json({ message: "Order not found" });

            order.paymentStatus = "Success";
            order.razorpayPaymentId = razorpayPaymentId;
            order.razorpaySignature = razorpaySignature;
            await order.save();

            // Empty user cart after successful order
            const user = await User.findById(order.userId);
            if (user) {
                user.cart = [];
                user.totalItems = 0;
                user.totalPrice = 0;
                await user.save();
            }

            res.status(200).json({ message: "Payment verified successfully", order });
            try {
                // 1. Razorpay se payment fetch karo
                const payment = await razorpay.payments.fetch(razorpayPaymentId);

                let paymentMethod = "Unknown";

                if (!payment || !payment.method) {
                    throw new Error("Payment details not found");
                }

                // 2. method ke hisaab se assign karenge
                switch (payment.method) {
                    case "wallet":
                        paymentMethod = `Wallet - ${payment.wallet || "Unknown Wallet"}`;
                        break;
                    case "upi":
                        paymentMethod = `UPI - ${payment.vpa || "Unknown VPA"}`;
                        break;
                    case "card":
                        paymentMethod = `Card - ${payment.card_id || "Unknown Card"}`;
                        break;
                    case "netbanking":
                        paymentMethod = `NetBanking - ${payment.bank || "Unknown Bank"}`;
                        break;
                    default:
                        paymentMethod = payment.method || "Other";
                }

                // Update Order Status
                const order = await Order.findOne({ razorpayOrderId });
                if (!order) return res.status(404).json({ message: "Order not found" });

                order.paymentMethod = paymentMethod;
                await order.save();

            } catch (error) {
                console.error("❌ Error fetching payment:", error.message);
                return { success: false, message: "Failed to fetch payment method", error: error.message };
            }



        } else {
            const order = await Order.findOne({ razorpayOrderId });
            if (!order) return res.status(404).json({ message: "Order not found" });
            order.paymentStatus = "Cancelled";
            order.razorpayPaymentId = razorpayPaymentId;
            order.razorpaySignature = razorpaySignature;
            await order.save();

            res.status(400).json({ message: "Invalid signature" });
        }

    } catch (error) {
        const order = await Order.findOne({ razorpayOrderId });
        if (!order) return res.status(404).json({ message: "Order not found" });
        order.paymentStatus = "failed";
        order.razorpayPaymentId = razorpayPaymentId;
        order.razorpaySignature = razorpaySignature;
        await order.save();
        console.error(error);
        res.status(500).json({ message: "Payment verification failed", error });
    }
};
