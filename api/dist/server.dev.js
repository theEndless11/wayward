"use strict";

var express = require('express');

var mongoose = require('mongoose');

var Ably = require('ably');

var cors = require('cors');

require('dotenv').config(); // To load environment variables from .env file


var app = express();
var port = process.env.PORT || 3000; // MongoDB connection using environment variable

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(function () {
  return console.log('MongoDB connected');
})["catch"](function (err) {
  return console.log('MongoDB connection error:', err);
}); // Import the Message model

var Message = require('./message'); // Import schema from message.js
// Use middleware


app.use(express.json());
app.use(cors()); // Initialize Ably with API Key from environment variable

var ably = new Ably.Realtime({
  key: process.env.ABLY_API_KEY
});
var publicChannel = ably.channels.get('chat'); // Listen for new messages on the public chat and save them to MongoDB

publicChannel.subscribe('message', function _callee(message) {
  var newMessage;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          newMessage = new Message({
            text: message.data.text
          });
          _context.next = 3;
          return regeneratorRuntime.awrap(newMessage.save());

        case 3:
          console.log('Message saved to DB:', message.data.text);

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}); // API to get all messages from the MongoDB database

app.get('/messages', function _callee2(req, res) {
  var messages;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Message.find().sort({
            timestamp: -1
          }));

        case 3:
          messages = _context2.sent;
          res.json(messages);
          _context2.next = 10;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          res.status(500).json({
            error: 'Failed to fetch messages'
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
}); // Serve static files (HTML, JS, etc.) - if you have them in a public folder

app.use(express["static"]('public')); // Vercel Serverless Function (For deployment on Vercel)

module.exports = app;
//# sourceMappingURL=server.dev.js.map
