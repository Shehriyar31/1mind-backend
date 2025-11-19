const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const exchangeRoutes = require('./src/routes/exchanges');
const accountRequestRoutes = require('./src/routes/accountRequests');
const bankAccountRoutes = require('./src/routes/bankAccounts');
const depositRequestRoutes = require('./src/routes/depositRequests');
const withdrawRequestRoutes = require('./src/routes/withdrawRequests');
const complaintRoutes = require('./src/routes/complaints');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/account-requests', accountRequestRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/deposit-requests', depositRequestRoutes);
app.use('/api/withdraw-requests', withdrawRequestRoutes);
app.use('/api/complaints', complaintRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('File upload limit: 50MB');
});