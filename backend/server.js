require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());

// CORS — allow local dev frontends and optional production URL from env.
const localDevOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server).
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || localDevOriginRegex.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Connect to MongoDB
console.log('Attempting MongoDB connection...');
console.log('MONGO_URI starts with:', process.env.MONGO_URI?.substring(0, 40));
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
      console.error('MongoDB connection FAILED:');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/triage', require('./routes/triage'));
app.use('/api/patients', require('./routes/patients'));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));