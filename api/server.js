const express = require('express');
const mongoose = require('mongoose');
const Ably = require('ably');
const cors = require('cors');
require('dotenv').config(); // To load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Import the Message model
const Message = require('./message');  // Import schema from message.js

// Use middleware
app.use(express.json());
app.use(cors());

// Initialize Ably with API Key from environment variable
const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
const publicChannel = ably.channels.get('chat');

// Listen for new messages on the public chat and save them to MongoDB
publicChannel.subscribe('message', async (message) => {
    const newMessage = new Message({ text: message.data.text });
    await newMessage.save();
    console.log('Message saved to DB:', message.data.text);
});

// API to get all messages from the MongoDB database
app.get('/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Serve static files (HTML, JS, etc.) - if you have them in a public folder
app.use(express.static('public'));

// Vercel Serverless Function (For deployment on Vercel)
module.exports = app;
