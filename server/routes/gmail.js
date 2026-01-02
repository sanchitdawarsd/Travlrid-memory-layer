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

    // Create auth data object
    const authData = {
      provider: 'gmail',
      email: userInfo.email,
      tokens: tokens
    };

    // Encode the auth data as base64
    const encodedAuth = Buffer.from(JSON.stringify(authData)).toString('base64');
    
    // Redirect with auth token
    res.redirect(`${process.env.CLIENT_URL}?auth=${encodedAuth}&provider=gmail`);
  } catch (error) {
    console.error('Gmail callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Check authentication status (for backward compatibility)
router.get('/status', (req, res) => {
  // Token-based auth doesn't need server-side status check
  // Client checks localStorage instead
  res.json({ authenticated: false });
});

// Logout (for backward compatibility)
router.post('/logout', (req, res) => {
  // Token-based auth - logout is handled client-side
  res.json({ success: true });
});

module.exports = router;

