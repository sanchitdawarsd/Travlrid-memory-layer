const express = require('express');
const router = express.Router();
const outlookService = require('../services/outlookService');

// Initiate Outlook OAuth
router.get('/auth', async (req, res) => {
  try {
    const authUrl = await outlookService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Outlook auth error:', error);
    res.status(500).json({ error: 'Failed to initiate Outlook authentication' });
  }
});

// Outlook OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.CLIENT_URL}?error=no_code`);
  }

  try {
    const authResult = await outlookService.getTokens(code);
    const userInfo = await outlookService.getUserInfo(authResult.accessToken);

    // Create auth data object
    const authData = {
      provider: 'outlook',
      email: userInfo.mail || userInfo.userPrincipalName,
      tokens: authResult
    };

    // Encode the auth data as base64
    const encodedAuth = Buffer.from(JSON.stringify(authData)).toString('base64');
    
    // Redirect with auth token
    res.redirect(`${process.env.CLIENT_URL}?auth=${encodedAuth}&provider=outlook`);
  } catch (error) {
    console.error('Outlook callback error:', error);
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

