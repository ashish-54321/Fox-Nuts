// controllers/cartController.js
const User = require("../models/User");
const products = require("../utils/products");

// Helper: calculate totals
const calculateTotals = (cart) => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (parseFloat(item.newPrice) * item.quantity), 0);
    return { totalItems, totalPrice };
};

// Add to Cart
exports.addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Find product from static list
        const product = products.find(p => p.id === Number(productId));
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Check if product already exists in cart
        const existingItem = user.cart.find(item => item.productId === Number(productId));

        if (existingItem) {
            // 👇 Kuch bhi update/add nahi karna
            return res.status(200).json({
                message: "Product already exists in cart",
                cart: user.cart,
                totalItems: user.totalItems,
                totalPrice: user.totalPrice
            });
        }

        // Otherwise push new product in cart
        user.cart.push({
            productId: product.id,
            name: product.name,
            image: product.image,
            oldPrice: product.oldPrice,
            newPrice: product.newPrice,
            label: product.label,
            quantity
        });

        // Recalculate totals
        const totalItems = user.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = user.cart.reduce((sum, item) => sum + (parseFloat(item.newPrice) * item.quantity), 0);

        user.totalItems = totalItems;
        user.totalPrice = totalPrice;

        await user.save();

        res.status(200).json({
            message: "Product added to cart",
            cart: user.cart,
            totalItems,
            totalPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};



// Update Quantity
exports.updateQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 👇 convert productId to number for comparison
        const item = user.cart.find(p => p.productId === Number(productId));
        if (!item) return res.status(404).json({ message: "Product not in cart" });

        item.quantity = quantity;

        // Recalculate totals
        const totalItems = user.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = user.cart.reduce((sum, item) => sum + (parseFloat(item.newPrice) * item.quantity), 0);

        user.totalItems = totalItems;
        user.totalPrice = totalPrice;

        await user.save();

        res.status(200).json({
            message: "Cart updated",
            cart: user.cart,
            totalItems,
            totalPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};


// Delete product from cart
exports.deleteFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: "UserId and ProductId are required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Convert to number for safe comparison
        const productIdNum = Number(productId);

        // Find product index
        const itemIndex = user.cart.findIndex(p => p.productId === productIdNum);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        // Remove that product
        user.cart.splice(itemIndex, 1);

        // Recalculate totals
        const totalItems = user.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = user.cart.reduce((sum, item) => sum + (parseFloat(item.newPrice) * item.quantity), 0);

        user.totalItems = totalItems;
        user.totalPrice = totalPrice;

        await user.save();

        res.status(200).json({
            message: "Product removed from cart",
            cart: user.cart,
            totalItems,
            totalPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Clear complete cart
exports.clearCart = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Clear cart
        user.cart = [];
        user.totalItems = 0;
        user.totalPrice = 0;

        await user.save();

        res.status(200).json({
            message: "Cart cleared successfully",
            cart: user.cart,
            totalItems: user.totalItems,
            totalPrice: user.totalPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};


// View Cart
exports.viewCart = async (req, res) => {
    try {
        const { userId } = req.body;  // yaa query params se bhi le sakte ho

        if (!userId) {
            return res.status(400).json({ message: "UserId is required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Cart fetched successfully",
            cart: user.cart,
            totalItems: user.totalItems,
            totalPrice: user.totalPrice
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};
