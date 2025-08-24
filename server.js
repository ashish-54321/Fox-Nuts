const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
// Enable Express to trust X-Forwarded-For header (for real client IP)
// Trust the first proxy (safe for most deployments)
app.set('trust proxy', 1);

const origin = 'http://localhost:5173'
// const origin = [
//     "https://nutritionalnuts.com",
//     "https://testingfoxnuts.netlify.app"
// ];

// CORS configuration
app.use(cors({
    origin: origin, // Replace with your domain(s)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Rate limiter middleware
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100,
    message: {
        status: 429,
        error: 'Too many requests. Please try again later.'
    }
});
app.use(limiter);

app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.send("Api's Now Live By Ashish Tiwari");
});

// All Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/email', require('./routes/emailRoutes.js'));
app.use("/api/cart", require('./routes/cartRoutes.js'));
app.use("/api/payment", require('./routes/paymentRoutes.js'));
app.use("/api/orders", require('./routes/orderRoutes.js'));
app.use("/api/address", require('./routes/addressRoutes.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
