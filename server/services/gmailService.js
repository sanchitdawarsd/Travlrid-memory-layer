const { google } = require('googleapis');

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

  async searchEmails(tokens, query, maxResults = 100) {
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
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      const part = message.payload.parts.find(p => p.mimeType === 'text/html' || p.mimeType === 'text/plain');
      if (part && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    return {
      id: messageId,
      subject,
      from,
      date,
      body
    };
  }

  async getBookingEmails(tokens) {
    const queries = [
      'subject:(booking confirmation) OR subject:(reservation confirmed) OR subject:(flight confirmation)',
      'subject:(hotel booking) OR subject:(hotel reservation)',
      'subject:(train ticket) OR subject:(rail booking)',
      'from:(booking.com) OR from:(airbnb.com) OR from:(expedia.com) OR from:(airlines.com)',
      'subject:(itinerary) AND (flight OR hotel OR train)'
    ];

    let allEmails = [];
    
    for (const query of queries) {
      const emails = await this.searchEmails(tokens, query, 50);
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

