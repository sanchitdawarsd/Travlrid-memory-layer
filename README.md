# TravlRid Email Scraper

A full-stack application that extracts travel booking data (flights, hotels, trains) from Gmail and Outlook emails using OAuth2 authentication.

## Features

✈️ **Flight Bookings** - Extracts flight confirmation details including PNR, flight numbers, routes, and dates  
🏨 **Hotel Reservations** - Captures hotel bookings with check-in/check-out dates and confirmation numbers  
🚆 **Train Tickets** - Retrieves train booking information including PNR and journey details  
📧 **Email Providers** - Supports both Gmail and Outlook/Microsoft accounts  
🔒 **Secure OAuth2** - Industry-standard authentication with user consent  
💾 **JSON Export** - Save extracted data in structured JSON format  
🎨 **Modern UI** - Beautiful, responsive React frontend with intuitive UX

## Architecture

### Backend (Node.js/Express)
- OAuth2 authentication for Gmail and Outlook
- Email fetching and filtering APIs
- Smart booking data parser with regex patterns
- Session management
- JSON data export

### Frontend (React)
- Modern, gradient-based UI design
- OAuth flow handling
- Real-time booking data display
- Downloadable JSON export
- Responsive design for all devices

## Prerequisites

- Node.js v14+ and npm
- Gmail API credentials (OAuth2 Client ID & Secret)
- Microsoft Azure App registration (for Outlook)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd email_scraper
npm run install-all
```

### 2. Configure Gmail OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:5001/auth/gmail/callback`
5. Copy Client ID and Client Secret

### 3. Configure Outlook/Microsoft OAuth2

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration:
   - Name: Email Scraper
   - Supported account types: Accounts in any organizational directory and personal Microsoft accounts
   - Redirect URI: Web - `http://localhost:5001/auth/outlook/callback`
4. Copy Application (client) ID
5. Go to Certificates & secrets > New client secret
6. Copy the secret value

### 4. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Gmail OAuth2
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REDIRECT_URI=http://localhost:5001/auth/gmail/callback

# Outlook OAuth2
OUTLOOK_CLIENT_ID=your_outlook_client_id
OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
OUTLOOK_REDIRECT_URI=http://localhost:5001/auth/outlook/callback
OUTLOOK_TENANT_ID=common

# Session
SESSION_SECRET=your_random_secret_key_here
```

### 5. Run the Application

Start both backend and frontend:

```bash
npm run dev
```

Or run separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

## Usage

1. **Login**: Choose Gmail or Outlook and authorize access
2. **Scan Emails**: Click "Scan My Emails" to fetch booking data
3. **View Results**: Browse extracted flights, hotels, and train bookings
4. **Download**: Export all data as JSON file

## API Endpoints

### Authentication

- `GET /auth/gmail/auth` - Initiate Gmail OAuth
- `GET /auth/gmail/callback` - Gmail OAuth callback
- `GET /auth/gmail/status` - Check Gmail auth status
- `POST /auth/gmail/logout` - Logout from Gmail

- `GET /auth/outlook/auth` - Initiate Outlook OAuth
- `GET /auth/outlook/callback` - Outlook OAuth callback
- `GET /auth/outlook/status` - Check Outlook auth status
- `POST /auth/outlook/logout` - Logout from Outlook

### Bookings

- `GET /api/bookings/fetch` - Fetch and parse booking emails
- `GET /api/bookings/saved` - List saved booking files
- `GET /api/bookings/saved/:filename` - Get specific booking file

## Data Structure

Extracted bookings are organized by type:

```json
{
  "flights": [
    {
      "id": "email_id",
      "type": "flight",
      "subject": "Flight Confirmation",
      "from": "airline@example.com",
      "date": "2024-01-01",
      "bookingDetails": {
        "confirmationNumber": "ABC123",
        "flightNumber": "AA1234",
        "airline": "American Airlines",
        "route": ["JFK", "LAX"],
        "date": "2024-01-15",
        "price": "450.00"
      }
    }
  ],
  "hotels": [...],
  "trains": [...],
  "unparsed": [...]
}
```

## Email Parsing Patterns

The parser recognizes common booking confirmation patterns from:

- Airlines: confirmation numbers, flight numbers, PNR codes
- Hotels: booking references, check-in/out dates, property names
- Trains: PNR numbers, train numbers, journey dates
- Booking sites: Booking.com, Expedia, Airbnb, etc.

## Security Considerations

- OAuth2 tokens are stored in server sessions (not client-side)
- Only reads emails, never sends or modifies them
- Credentials are stored in environment variables
- Session cookies are HTTP-only
- CORS configured for specific frontend URL

## Troubleshooting

### Gmail API Issues
- Ensure Gmail API is enabled in Google Cloud Console
- Verify redirect URI matches exactly
- Check OAuth consent screen configuration

### Outlook API Issues
- Verify Azure app registration redirect URI
- Ensure correct tenant ID (use 'common' for personal accounts)
- Check API permissions: Mail.Read, User.Read

### Port Already in Use
```bash
# Change PORT in .env file or kill existing process
lsof -ti:5001 | xargs kill -9  # macOS/Linux
```

## Development

### Project Structure

```
email_scraper/
├── server/
│   ├── index.js              # Express server
│   ├── routes/               # API routes
│   │   ├── gmail.js
│   │   ├── outlook.js
│   │   └── bookings.js
│   └── services/             # Business logic
│       ├── gmailService.js
│       ├── outlookService.js
│       └── bookingParser.js
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   └── BookingCard.js
│       └── App.js
├── data/                     # Saved booking JSON files
├── .env                      # Environment variables
└── package.json
```

## Future Enhancements

- [ ] Add support for more email providers (Yahoo, iCloud)
- [ ] Implement machine learning for better extraction
- [ ] Add calendar integration
- [ ] Export to other formats (CSV, PDF)
- [ ] Email notifications for new bookings
- [ ] Multi-language support
- [ ] Mobile app

## License

ISC

## Support

For issues or questions, please open an issue on the repository.

---

Built with ❤️ for travelers by TravlRid

