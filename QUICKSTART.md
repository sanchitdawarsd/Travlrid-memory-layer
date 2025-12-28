# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js v14+ installed
- A Gmail or Outlook account

## Installation

```bash
# 1. Install all dependencies (backend + frontend)
npm run install-all

# This will install dependencies in both root and client folders
```

## Configuration

### Option A: Test with Pre-configured Credentials (Not Recommended for Production)

For quick testing, you can use demo credentials (you'll need to get your own):

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your credentials
nano .env  # or use any text editor
```

### Option B: Set Up Your Own OAuth2 Apps (Recommended)

Follow the detailed instructions in `SETUP_GUIDE.md` to:
1. Create Gmail OAuth2 credentials
2. Create Outlook OAuth2 credentials
3. Add them to your `.env` file

## Run the Application

```bash
# Start both backend and frontend together
npm run dev
```

This will start:
- Backend server on http://localhost:5001
- Frontend app on http://localhost:3002

Your browser should automatically open to http://localhost:3002

## First Use

1. **Choose Your Email Provider**
   - Click "Continue with Gmail" or "Continue with Outlook"

2. **Authorize Access**
   - You'll be redirected to Google/Microsoft login
   - Sign in and grant permissions (read-only access to emails)

3. **Scan Your Emails**
   - Click "Scan My Emails" button
   - The app will search for travel booking confirmations

4. **View Results**
   - Browse your flights, hotels, and train bookings
   - Click on any booking to see details

5. **Download Data**
   - Click "Download JSON" to save all bookings to a file

## Troubleshooting

### Backend won't start

**Error**: Port 5001 already in use
```bash
# Kill the process using port 5001
lsof -ti:5001 | xargs kill -9
```

**Error**: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend won't start

**Error**: Port 3000 already in use
```bash
# The app will ask if you want to use another port
# Type 'Y' to use port 3000 instead
```

**Error**: Cannot connect to backend
- Make sure the backend is running on port 5001
- Check that `proxy` is set in `client/package.json`

### OAuth errors

**Gmail**: "Error 400: redirect_uri_mismatch"
- Solution: Ensure redirect URI in Google Console is exactly: `http://localhost:5001/auth/gmail/callback`

**Outlook**: "AADSTS50011: redirect URI mismatch"
- Solution: Ensure redirect URI in Azure Portal is exactly: `http://localhost:5001/auth/outlook/callback`

### No bookings found

This is normal if:
- You don't have travel booking emails
- Booking emails are older than what the API fetches (last 100 messages)
- Booking emails are in a format the parser doesn't recognize yet

Try:
- Forward yourself a flight/hotel confirmation email
- Wait a few minutes and scan again

## Next Steps

- Read `README.md` for full documentation
- Check `SETUP_GUIDE.md` for detailed OAuth2 setup
- Customize the email parsing patterns in `server/services/bookingParser.js`

## Need Help?

Common issues:
1. **No emails showing**: The parser looks for specific keywords. Check `server/services/gmailService.js` and `outlookService.js` for search queries
2. **OAuth not working**: Double-check your credentials in `.env` match those in Google Cloud Console / Azure Portal
3. **Parser not extracting data**: The regex patterns may need adjustment for your specific email formats

---

Happy travels! ✈️🏨🚆

