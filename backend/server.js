require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// 1. Core Security Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 2. Optimization Middlewares
app.use(compression()); // Gzip compression
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 3. Logger Middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting Middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
  }
});

// Apply rate limiting specifically to auth endpoints
app.use('/api/auth', authLimiter);

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));

// Root Check Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NarcoVT API is live and healthy',
    version: '1.0.0'
  });
});

// 6. Centralized Error Handling (must be registered last)
app.use(errorHandler);

// Define PORT and start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Promise Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
