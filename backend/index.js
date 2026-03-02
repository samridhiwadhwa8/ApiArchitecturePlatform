const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api-visualizer')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'API Visualizer Server is running!' });
});

// API routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const endpointRoutes = require('./routes/endpoints');
const flowRoutes = require('./routes/flows');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/endpoints', endpointRoutes);
app.use('/api/flows', flowRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
