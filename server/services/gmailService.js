const { google } = require('googleapis');
const {extractPlainText} = require('../utils/parsers');
class GmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
  }

  getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getUserInfo(tokens) {
    this.oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    return userInfo.data;
  }

  async searchEmails(tokens, query, maxResults) {
    this.oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults
      });

      if (!response.data.messages) {
        return [];
      }

      const messages = await Promise.all(
        response.data.messages.map(async (message) => {
          const msg = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return this.parseMessage(msg.data);
        })
      );

      return messages;
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }

  parseMessage(message) {
    const headers = message.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = headers.find(h => h.name === 'Date')?.value || '';
    const messageId = message.id;

    let body = '';
    
    // Helper function to extract body from parts recursively
    const extractBodyFromParts = (parts) => {
      for (const part of parts) {
        // Prefer plain text over HTML
        if (part.mimeType === 'text/plain' && part.body && part.body.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
      
      // If no plain text, try HTML
      for (const part of parts) {
        if (part.mimeType === 'text/html' && part.body && part.body.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
      
      // Check nested parts (multipart/alternative)
      for (const part of parts) {
        if (part.parts && part.parts.length > 0) {
          const nestedBody = extractBodyFromParts(part.parts);
          if (nestedBody) return nestedBody;
        }
      }
      
      return '';
    };

    if (message.payload.body && message.payload.body.data) {
      // Simple single-part message
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      // Multipart message
      body = extractBodyFromParts(message.payload.parts);
    }

    // Clean HTML tags and extract only text
    const cleanBody = extractPlainText(body);

    return {
      id: messageId,
      subject,
      from,
      date,
      body: cleanBody
    };
  }

  async getBookingEmails(tokens) {
    const queries = [
      // Flight Bookings - Focus on confirmation emails with PNR/booking references
      '(subject:(e-ticket) OR subject:(booking confirmation) OR subject:(flight confirmation) OR subject:(reservation confirmed) OR subject:(booking reference) OR subject:(PNR)) AND (from:(airlines) OR from:(amadeus) OR from:(sabre) OR from:(travelport)) -subject:(deals) -subject:(sale) -subject:(offer) -subject:(save)',
      
      // Specific Airlines (add more based on your region)
      'from:(noreply@united.com OR reservations@aa.com OR donotreply@delta.com OR noreply@southwest.com OR booking@ryanair.com OR noreply@jetblue.com OR confirmation@emirates.com OR booking@lufthansa.com OR noreply@airasia.com OR booking@indigo.com) subject:(confirmation OR itinerary OR e-ticket) -subject:(newsletter) -subject:(miles) -subject:(promotion)',
      
      // Hotels - Transaction emails only
      '(subject:(booking confirmation) OR subject:(reservation confirmation) OR subject:(booking details) OR subject:(confirmation number)) AND (from:(hotels.com) OR from:(booking.com) OR from:(marriott) OR from:(hilton) OR from:(hyatt) OR from:(ihg) OR from:(accor) OR from:(airbnb)) -subject:(deal) -subject:(discount) -subject:(special offer) -subject:(loyalty)',
      
      // Train/Rail Bookings
      'subject:(ticket confirmation OR booking confirmation OR PNR OR journey details) AND (from:(irctc) OR from:(amtrak) OR from:(raileurope) OR from:(trainline) OR from:(sncf) OR from:(deutschebahn) OR from:(eurostar)) -subject:(offers) -subject:(deals)',
      
      // Ground Transportation - Uber/Ola/Lyft/Car Rentals
      'from:(uber.com OR receipts@uber.com) subject:(receipt OR trip OR fare) -subject:(promo) -subject:(free ride)',
      'from:(ola.com OR auto-confirm@olacabs.com) subject:(receipt OR booking OR trip)',
      'from:(lyft.com) subject:(receipt OR ride OR trip)',
      'from:(hertz OR avis OR enterprise OR budget OR national OR europcar OR zipcar) subject:(confirmation OR reservation OR booking) -subject:(upgrade) -subject:(special)',
      
      // OTA Platforms (Online Travel Agencies) - Transactional only
      'from:(expedia OR priceline OR kayak OR orbitz OR travelocity OR agoda OR trip.com OR makemytrip OR cleartrip OR goibibo) subject:(confirmation OR voucher OR booking ID) has:attachment -subject:(price drop) -subject:(deals)',
      
      // Business Travel Platforms
      'from:(concur OR egencia OR travelperk OR tripactions OR cwt) subject:(itinerary OR confirmation OR approved)',
      
      // Additional filters to exclude promotional content
      'subject:(booking confirmation) -subject:(win) -subject:(congratulations) -subject:(feedback) -subject:(review) -subject:(survey) -subject:(rate) -subject:(experience)',
      
      // Catch-all for booking references with confirmation codes
      '(subject:(confirmation) OR subject:(confirmed) OR subject:(e-ticket)) AND ("booking reference" OR "confirmation number" OR "reservation number" OR "booking ID" OR "PNR" OR "record locator") -subject:(advertisement) -subject:(unsubscribe) -label:promotions'
    ];

    let allEmails = [];
    
    for (const query of queries) {
      const emails = await this.searchEmails(tokens, query, 10000);
      allEmails = allEmails.concat(emails);
    }

    // Remove duplicates based on message ID
    const uniqueEmails = Array.from(
      new Map(allEmails.map(email => [email.id, email])).values()
    );

    return uniqueEmails;
  }
}

module.exports = new GmailService();

