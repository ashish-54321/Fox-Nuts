const nodemailer = require("nodemailer");
const User = require('../models/User');
const Otp = require("../models/Otp.js");
const { OtpLimit, FormLimit } = require("../models/Limit");


exports.send = async (req, res) => {
    const { name, email, phone, quantity, address, type, message } = req.body;

    const forwarded = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    let ip = '';
    if (typeof forwarded === 'string') {
        const ipList = forwarded.split(',').map(ip => ip.trim());
        ip = `${ipList[0]}`
    } else {
        // fallback for direct IP
        ip = `${forwarded}`;
    }


    // CheckPoint
    if (!name || !email || !phone || !quantity || !address || !type || !message || !ip) {
        return res.status(400).send({ message: "All fields are required." });
    }

    // Check Rate Limit
    const rateLimit = await FormLimit.findOne({ ip });
    if (rateLimit) {
        if (rateLimit.count >= 20) {
            return res.status(429).json({ message: "You exceeded the limit. Try again after 24 hours." });
        }

        // Increment count
        rateLimit.count += 1;
        await rateLimit.save();
    } else {
        // Create new limit document
        const newrateLimit = new FormLimit({ ip, count: 1 });
        await newrateLimit.save();
    }


    let transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 465,
        secure: true,
        auth: {
            user: process.env.User,
            pass: process.env.Pass,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Website Enquiry" <official@nutritionalnuts.com>`,
            to: "official@nutritionalnuts.com", // ✅ You receive it yourself
            subject: "New Enquiry from Website",
            html: `
        <h3>Customer Name: ${name}</h3>
        <p><strong>customer Email</strong>: ${email} </p>
        <p><strong>customer Phone No. </strong>: ${phone} </p>
        <p><strong>customer Address</strong>: ${address} </p>
        <h2>----------------------------------------------------------------------</h2>
        <h3> Enquiry Regarding </h3>
        <p><strong>Makhana Type</strong>: ${type} </p>
        <p><strong>Quantity</strong>: ${quantity} </p>
        <p><strong>Enquiry Message</strong>: ${message}</p>
      `,
        });

        res.status(200).send({ message: "Email sent" });
    } catch (error) {
        console.error("Email sending failed:", error);
        res.status(500).send({ message: "Email failed", error });
    }
};

exports.sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Check Rate Limit
    const rateLimit = await OtpLimit.findOne({ email });
    if (rateLimit) {
        if (rateLimit.count >= 3) {
            return res.status(429).json({ message: "You exceeded the OTP limit. Try again after 24 hours." });
        }

        // Increment count
        rateLimit.count += 1;
        await rateLimit.save();
    } else {
        // Create new limit document
        const newrateLimit = new OtpLimit({ email, count: 1 });
        await newrateLimit.save();
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in MongoDB
    try {
        await Otp.create({ email, otp: otpCode });

        let transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true,
            auth: {
                user: process.env.User,
                pass: process.env.Pass,
            },
        });

        await transporter.sendMail({
            from: `"Nutritional Nuts" <official@nutritionalnuts.com>`,
            to: email,
            subject: "Your OTP Code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50; text-align: center;">🔐 Email Verification</h2>
            <p style="font-size: 16px; color: #333;">Dear User,</p>
            <p style="font-size: 16px; color: #333;">
            Thank you for using <strong>Nutritional Nuts</strong>. To continue, please use the OTP below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #eaf7e1; color: #27ae60; font-size: 28px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;">
            ${otpCode}
            </span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
             This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 13px; color: #999; text-align: center;">
              If you did not request this, please ignore this email or contact support.
            </p>
            </div>
            `,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("OTP send error:", err);
        res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }
};

exports.resetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(400).json({ message: "This Email Not Register" });

    // Check Rate Limit
    const rateLimit = await OtpLimit.findOne({ email });
    if (rateLimit) {
        if (rateLimit.count >= 3) {
            return res.status(429).json({ message: "You exceeded the OTP limit. Try again after 24 hours." });
        }

        // Increment count
        rateLimit.count += 1;
        await rateLimit.save();
    } else {
        // Create new limit document
        const newrateLimit = new OtpLimit({ email, count: 1 });
        await newrateLimit.save();
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in MongoDB
    try {
        await Otp.create({ email, otp: otpCode });

        let transporter = nodemailer.createTransport({
            host: "smtpout.secureserver.net",
            port: 465,
            secure: true,
            auth: {
                user: process.env.User,
                pass: process.env.Pass,
            },
        });

        await transporter.sendMail({
            from: `"Nutritional Nuts" <official@nutritionalnuts.com>`,
            to: email,
            subject: "Your OTP Code",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #2c3e50; text-align: center;">🔐 Email Verification</h2>
            <p style="font-size: 16px; color: #333;">Dear User,</p>
            <p style="font-size: 16px; color: #333;">
            Thank you for using <strong>Nutritional Nuts</strong>. To continue, please use the OTP below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; background-color: #eaf7e1; color: #27ae60; font-size: 28px; font-weight: bold; padding: 15px 30px; border-radius: 8px; letter-spacing: 3px;">
            ${otpCode}
            </span>
            </div>
            <p style="font-size: 14px; color: #888; text-align: center;">
             This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.
            </p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 13px; color: #999; text-align: center;">
              If you did not request this, please ignore this email or contact support.
            </p>
            </div>
            `,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
        console.error("OTP send error:", err);
        res.status(500).json({ message: "Failed to send OTP", error: err.message });
    }
};
