// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jsonServer = require('json-server');
const fs = require('fs');
const nodemailer = require('nodemailer');
const helmet = require('helmet'); // Added for security
const rateLimit = require('express-rate-limit'); // Added for rate limiting

const app = express();
const port = process.env.PORT || 3001;

// Security Middleware
app.use(helmet()); // Helps secure Express apps by setting various HTTP headers

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Middleware
app.use(express.json({
  limit: '10kb' // Limit payload size
}));
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  'https://matexstore.vercel.app',
  'http://localhost:5173', // Local development
  'http://localhost:4173'  // Local preview
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email Configuration Verification
transporter.verify(function(error, success) {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send emails');
  }
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Order Placement Endpoint
app.post('/api/place-order', async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    const { orderDetails, soldProducts } = req.body;
    
    // Validate input
    if (!orderDetails || !soldProducts) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required order data' 
      });
    }

    // Email Sending
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'matexshoes@gmail.com',
        subject: 'New Order Received - MATex Shoes',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2dd4bf;">New Order Received!</h1>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Customer Details</h2>
              <p><strong>Name:</strong> ${orderDetails.name}</p>
              <p><strong>Email:</strong> ${orderDetails.email}</p>
              <p><strong>Phone:</strong> ${orderDetails.phone}</p>
              <p><strong>Address:</strong> ${orderDetails.address}</p>
              <p><strong>City:</strong> ${orderDetails.city}</p>
              <p><strong>Additional Notes:</strong> ${orderDetails.notes || 'None'}</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>Ordered Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #e5e7eb;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Shoe ID</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Name</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #cbd5e1;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderDetails.items.map(item => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 12px;">${item.id}</td>
                      <td style="padding: 12px;">${item.name}</td>
                      <td style="padding: 12px; text-align: right;">Rs. ${item.price}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <h2>Order Summary</h2>
              <p><strong>Total Amount:</strong> Rs. ${orderDetails.total}</p>
              <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent successfully');
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue with order processing even if email fails
    }

    // Database Update
    const dbPath = './db.json';
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Update shoe availability
    db.shoes = db.shoes.map(shoe => ({
      ...shoe,
      isSoldOut: soldProducts.includes(shoe.id) ? true : shoe.isSoldOut
    }));

    // Initialize orders array if not exists
    if (!db.orders) {
      db.orders = [];
    }

    // Create new order
    const newOrder = {
      id: Date.now(),
      orderDate: new Date().toISOString(),
      ...orderDetails
    };

    db.orders.push(newOrder);

    // Save updated database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ 
      success: true, 
      message: 'Order placed successfully',
      orderId: newOrder.id
    });

  } catch (error) {
    console.error('Server error during order placement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
});

// JSON Server setup
const router = jsonServer.router('./db.json');
app.use('/api', router);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 Handler
app.use((req, res) => {
  res. status(404).json({ message: 'Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});