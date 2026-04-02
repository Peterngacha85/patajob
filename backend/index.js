const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

dotenv.config();

connectDB();

const app = express();

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL, // Production URL
            'http://localhost:5173',  // Local frontend development (Vite default)
            'http://localhost:3000'   // Local frontend development alternative
        ].filter(Boolean); // Remove undefined values

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies to be sent with requests
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/providers', require('./src/routes/providerRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/feedback', require('./src/routes/feedbackRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n\x1b[35m%s\x1b[0m`, `--------------------------------------------------`);
    console.log(`\x1b[35m%s\x1b[0m`, `  🚀 PataJob Server is running!`);
    console.log(`\x1b[35m%s\x1b[0m`, `  📂 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\x1b[35m%s\x1b[0m`, `  📡 Port: ${PORT}`);
    console.log(`\x1b[35m%s\x1b[0m`, `  🔗 URL: http://localhost:${PORT}`);
    console.log(`\x1b[35m%s\x1b[0m`, `--------------------------------------------------\n`);
});
