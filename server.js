const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Add a test route to verify the server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Other routes
const workerBookingRoutes = require('./routes/workerBookings');
app.use('/api/worker-bookings', workerBookingRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const technicianRoutes = require('./routes/technicians');
app.use('/api/technicians', technicianRoutes);

const contactRoutes = require('./routes/contact');
app.use('/api/contact', contactRoutes);

const orderRoutes = require('./routes/order');
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/test`);
});

module.exports = app;