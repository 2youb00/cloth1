const express = require('express');
const router = express.Router();

// Simple in-memory storage for newsletter subscribers
let subscribers = [];

// Subscribe to newsletter
router.post('/subscribe', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  
  if (subscribers.includes(email)) {
    return res.status(400).json({ message: 'Email already subscribed' });
  }
  
  subscribers.push(email);
  res.status(201).json({ message: 'Successfully subscribed to newsletter' });
});

module.exports = router;