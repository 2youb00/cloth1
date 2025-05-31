const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const adminAuth = require('../middleware/adminAuth');

// Get site settings
router.get('/', async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings({
        siteName: 'Vintage Shop',
        heroImage: '/placeholder.svg?height=400&width=800',
        heroTitle: 'Welcome to our Vintage Shop',
        heroSubtitle: 'Discover timeless fashion pieces',
        categories: ['Shirts', 'Pants', 'Accessories'],
        footerText: 'Find unique vintage clothing',
        contactEmail: 'contact@vintageshop.com',
        contactPhone: '123-456-7890',
        socialLinks: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
        },
      });
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update site settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;