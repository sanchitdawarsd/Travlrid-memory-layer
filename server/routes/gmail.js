const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmailService');

// Initiate Gmail OAuth
router.get('/auth', (req, res) => {
  try {
    const authUrl = gmailService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Gmail auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Gmail authentication' });
  }
});

// Gmail OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}?error=no_code`);
  }

  try {
    const tokens = await gmailService.getTokens(code);
    const userInfo = await gmailService.getUserInfo(tokens);

    req.session.gmailTokens = tokens;
    req.session.userEmail = userInfo.email;
    req.session.provider = 'gmail';

    res.redirect(`${process.env.CLIENT_URL}?success=true&provider=gmail`);
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session.gmailTokens && req.session.provider === 'gmail') {
    res.json({
      authenticated: true,
      email: req.session.userEmail,
      provider: 'gmail'
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;

