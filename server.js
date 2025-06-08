const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cors({ origin: "https://nutritionalnuts.netlify.app", credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
