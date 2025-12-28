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

    req.session.outlookTokens = authResult;
    req.session.userEmail = userInfo.mail || userInfo.userPrincipalName;
    req.session.provider = 'outlook';

    res.redirect(`${process.env.CLIENT_URL}?success=true&provider=outlook`);
  } catch (error) {
    console.error('Outlook callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.session.outlookTokens && req.session.provider === 'outlook') {
    res.json({
      authenticated: true,
      email: req.session.userEmail,
      provider: 'outlook'
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

