const msal = require('@azure/msal-node');
const axios = require('axios');

class OutlookService {
  constructor() {
    this.msalConfig = {
      auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID || 'common'}`,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
      }
    };
    
    this.pca = new msal.ConfidentialClientApplication(this.msalConfig);
    this.redirectUri = process.env.OUTLOOK_REDIRECT_URI;
  }

  getAuthUrl() {
    const authCodeUrlParameters = {
      scopes: ['user.read', 'mail.read'],
      redirectUri: this.redirectUri,
    };

    return this.pca.getAuthCodeUrl(authCodeUrlParameters);
  }

  async getTokens(code) {
    const tokenRequest = {
      code: code,
      scopes: ['user.read', 'mail.read'],
      redirectUri: this.redirectUri,
    };

    const response = await this.pca.acquireTokenByCode(tokenRequest);
    return response;
  }

  async getUserInfo(accessToken) {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  async searchEmails(accessToken, query, maxResults = 100) {
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$filter=${encodeURIComponent(query)}&$top=${maxResults}&$select=id,subject,from,receivedDateTime,body`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data.value.map(msg => ({
        id: msg.id,
        subject: msg.subject,
        from: msg.from?.emailAddress?.address || '',
        date: msg.receivedDateTime,
        body: msg.body?.content || ''
      }));
    } catch (error) {
      console.error('Error fetching Outlook messages:', error);
      throw error;
    }
  }

  async getBookingEmails(accessToken) {
    const queries = [
      "subject eq 'booking confirmation'",
      "subject eq 'reservation confirmed'",
      "subject eq 'flight confirmation'",
      "subject eq 'hotel booking'",
      "subject eq 'train ticket'"
    ];

    // For Outlook, we'll do a broader search
    try {
      const response = await axios.get(
        `https://graph.microsoft.com/v1.0/me/messages?$top=100&$select=id,subject,from,receivedDateTime,body&$orderby=receivedDateTime desc`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const allEmails = response.data.value.map(msg => ({
        id: msg.id,
        subject: msg.subject || '',
        from: msg.from?.emailAddress?.address || '',
        date: msg.receivedDateTime,
        body: msg.body?.content || ''
      }));

      // Filter for booking-related emails
      const bookingKeywords = [
        'booking', 'reservation', 'confirmation', 'flight', 'hotel', 
        'train', 'itinerary', 'ticket', 'check-in', 'airbnb', 
        'expedia', 'booking.com', 'airlines'
      ];

      return allEmails.filter(email => {
        const searchText = `${email.subject} ${email.from}`.toLowerCase();
        return bookingKeywords.some(keyword => searchText.includes(keyword));
      });
    } catch (error) {
      console.error('Error fetching booking emails:', error);
      throw error;
    }
  }
}

module.exports = new OutlookService();

