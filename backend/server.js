require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initScheduler, fetchAndSyncDailyContests } = require('./cron/scheduler');
const { authRouter } = require('./routes/auth');
const contestRouter = require('./routes/contests');
const adminRouter = require('./routes/admin');
const quoteRouter = require('./routes/quotes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/ping', (req, res) => res.status(200).json({ status: 'pong' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'API is running', timestamp: new Date() }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/contests', contestRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/quotes', quoteRouter);
app.get('/api/v1/health', (req, res) => res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
}));

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/contest_tracker')
  .then(async () => {
      console.log('Connected to MongoDB');
      
      // Initialize Background Jobs
      initScheduler();
      
      // Force an initial sync when the server starts if there are no contests in DB
      // Alternatively, we can just run it to ensure data is fresh.
      await fetchAndSyncDailyContests();
  })
  .catch(err => {
      console.error('Error connecting to MongoDB:', err.message);
      process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
