# Detailed Setup Guide

This guide will walk you through setting up OAuth2 credentials for Gmail and Outlook.

## Gmail OAuth2 Setup

### Step 1: Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Email Scraper" or any name you prefer
4. Click "Create"

### Step 2: Enable Gmail API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on it and press "Enable"

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - App name: "Email Scraper"
   - User support email: your email
   - Developer contact: your email
5. Click "Save and Continue"
6. Scopes: Click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/gmail.readonly`
   - Add: `https://www.googleapis.com/auth/userinfo.email`
7. Click "Save and Continue"
8. Test users: Add your email address
9. Click "Save and Continue"

### Step 4: Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "Email Scraper Client"
5. Authorized redirect URIs:
   - Add: `http://localhost:5001/auth/gmail/callback`
   - For production, add your domain: `https://yourdomain.com/auth/gmail/callback`
6. Click "Create"
7. **Copy the Client ID and Client Secret** - you'll need these for your `.env` file

### Step 5: Add Credentials to .env

```env
GMAIL_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret_here
GMAIL_REDIRECT_URI=http://localhost:5001/auth/gmail/callback
```

## Outlook/Microsoft OAuth2 Setup

### Step 1: Register Azure Application

1. Visit [Azure Portal](https://portal.azure.com/)
2. Sign in with your Microsoft account
3. Go to "Azure Active Directory" (search in top bar)
4. Click "App registrations" in the left sidebar
5. Click "New registration"

### Step 2: Configure App Registration

1. Fill in the registration form:
   - Name: "Email Scraper"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox)"
   - Redirect URI: 
     - Platform: Web
     - URI: `http://localhost:5001/auth/outlook/callback`
2. Click "Register"
3. **Copy the Application (client) ID** - you'll need this for `.env`
4. **Copy the Directory (tenant) ID** - though we'll use 'common' for personal accounts

### Step 3: Create Client Secret

1. In your app registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "Email Scraper Secret"
4. Expires: Choose duration (6 months, 12 months, or 24 months)
5. Click "Add"
6. **IMPORTANT**: Copy the secret VALUE immediately - it won't be shown again!

### Step 4: Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Delegated permissions"
5. Add these permissions:
   - `Mail.Read` - Read user mail
   - `User.Read` - Sign in and read user profile
6. Click "Add permissions"
7. (Optional) Click "Grant admin consent" if you have admin rights

### Step 5: Add Credentials to .env

```env
OUTLOOK_CLIENT_ID=your_application_client_id_here
OUTLOOK_CLIENT_SECRET=your_client_secret_value_here
OUTLOOK_REDIRECT_URI=http://localhost:5001/auth/outlook/callback
OUTLOOK_TENANT_ID=common
```

## Common Issues and Solutions

### Gmail Issues

**Issue**: "Access blocked: This app's request is invalid"
- **Solution**: Make sure redirect URI in Google Console matches exactly with your `.env` file

**Issue**: "This app isn't verified"
- **Solution**: This is normal for development. Click "Advanced" → "Go to [App Name] (unsafe)"

**Issue**: "Error 400: redirect_uri_mismatch"
- **Solution**: Check that the redirect URI in both Google Console and `.env` match exactly (including http/https, port, path)

### Outlook Issues

**Issue**: "AADSTS50011: The redirect URI doesn't match"
- **Solution**: Verify the redirect URI in Azure Portal matches your `.env` file exactly

**Issue**: "Need admin approval"
- **Solution**: The app is requesting permissions that need approval. Either:
  - Grant admin consent in Azure Portal
  - Or use a personal Microsoft account for testing

**Issue**: "AADSTS7000215: Invalid client secret"
- **Solution**: The client secret might have expired or was copied incorrectly. Create a new one.

## Testing Your Setup

1. Start the backend server:
```bash
npm run server
```

2. Start the frontend:
```bash
npm run client
```

3. Open `http://localhost:3000` in your browser

4. Click "Continue with Gmail" or "Continue with Outlook"

5. You should be redirected to the respective login page

6. After authorizing, you should be redirected back to the dashboard

## Production Deployment Checklist

- [ ] Update `CLIENT_URL` in `.env` to your production frontend URL
- [ ] Update redirect URIs in Google Cloud Console and Azure Portal
- [ ] Use HTTPS for all redirect URIs in production
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable OAuth consent screen verification for public use (Gmail)
- [ ] Request admin consent for organizational use (Outlook)
- [ ] Set up proper CORS configuration
- [ ] Use environment variables, never commit `.env` file

## Security Best Practices

1. **Never commit credentials**: Always keep `.env` in `.gitignore`
2. **Use HTTPS in production**: OAuth2 should always use secure connections
3. **Rotate secrets regularly**: Change client secrets periodically
4. **Limit scope**: Only request necessary permissions
5. **Store tokens securely**: Use encrypted sessions in production
6. **Implement token refresh**: Handle expired tokens gracefully
7. **Rate limiting**: Implement API rate limiting to prevent abuse

## Need Help?

- Gmail API Documentation: https://developers.google.com/gmail/api
- Microsoft Graph Documentation: https://docs.microsoft.com/en-us/graph/
- OAuth2 Flow Guide: https://oauth.net/2/

---

If you encounter any issues not covered here, please check the main README.md or open an issue.

