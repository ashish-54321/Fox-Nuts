const User = require("../models/User");

// Save new address
exports.saveAddress = async (req, res) => {
    try {
        const { userId, address } = req.body; // frontend se aayega

        if (!userId || !address) {
            return res.status(400).json({ message: "UserId and address required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Add address to user
        user.addresses.push(address);
        await user.save();

        res.status(200).json({ message: "Address saved successfully", addresses: user.addresses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// ✅ Fetch all addresses of a user
exports.getAddresses = async (req, res) => {
    try {
        const { userId } = req.params; // URL se milega

        const user = await User.findById(userId).select("addresses");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Addresses fetched successfully",
            addresses: user.addresses
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    try {
        const { userId, addressId } = req.body;

        if (!userId || !addressId) {
            return res.status(400).json({ message: "userId and addressId are required" });
        }

        // pull address by _id
        const user = await User.findByIdAndUpdate(
            userId,
            { $pull: { addresses: { _id: addressId } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            message: "Address deleted successfully",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Update address
exports.updateAddress = async (req, res) => {
    try {
        const { userId, addressId, updatedData } = req.body;

        if (!userId || !addressId) {
            return res.status(400).json({ message: "userId and addressId are required" });
        }

        // find user and update specific address
        const user = await User.findOneAndUpdate(
            { _id: userId, "addresses._id": addressId },
            {
                $set: {
                    "addresses.$.label": updatedData.label,
                    "addresses.$.house": updatedData.house,
                    "addresses.$.floor": updatedData.floor,
                    "addresses.$.address": updatedData.address,
                    "addresses.$.landmark": updatedData.landmark,
                    "addresses.$.phone": updatedData.phone,
                    "addresses.$.location": updatedData.location,
                }
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User or Address not found" });
        }

        res.json({
            message: "Address updated successfully",
            addresses: user.addresses
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
