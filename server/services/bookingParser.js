const cheerio = require('cheerio');

class BookingParser {
  constructor() {
    this.patterns = {
      flight: {
        keywords: ['flight', 'airline', 'boarding', 'departure', 'arrival', 'pnr', 'booking reference'],
        confirmationNumber: /(?:confirmation|booking|pnr|reference)[\s#:]*([A-Z0-9]{6,})/gi,
        flightNumber: /(?:flight|flt)[\s#:]*([A-Z]{2}\d{3,4})/gi,
        date: /(?:departure|depart|date)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{2}[-\/]\d{2})/gi,
        airline: /(?:airline|carrier)[\s:]*([A-Za-z\s]+)/gi,
        route: /([A-Z]{3})\s*(?:to|->|→)\s*([A-Z]{3})/gi,
        price: /(?:total|price|fare|amount)[\s:]*(?:USD|EUR|GBP|INR|₹|\$|€|£)?[\s]*(\d+[\d,]*\.?\d{0,2})/gi
      },
      hotel: {
        keywords: ['hotel', 'accommodation', 'room', 'check-in', 'check-out', 'night', 'guest'],
        confirmationNumber: /(?:confirmation|booking|reservation)[\s#:]*([A-Z0-9]{6,})/gi,
        hotelName: /(?:hotel|property)[\s:]*([A-Za-z\s&]+)/gi,
        checkIn: /(?:check-?in|arrival)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{2}[-\/]\d{2})/gi,
        checkOut: /(?:check-?out|departure)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{2}[-\/]\d{2})/gi,
        price: /(?:total|price|amount|cost)[\s:]*(?:USD|EUR|GBP|INR|₹|\$|€|£)?[\s]*(\d+[\d,]*\.?\d{0,2})/gi,
        location: /(?:address|location|city)[\s:]*([A-Za-z\s,]+)/gi
      },
      train: {
        keywords: ['train', 'railway', 'rail', 'coach', 'seat', 'platform', 'pnr'],
        confirmationNumber: /(?:pnr|confirmation|booking)[\s#:]*([A-Z0-9]{6,})/gi,
        trainNumber: /(?:train)[\s#:]*(\d{4,5})/gi,
        date: /(?:journey|travel|date)[\s:]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{2}[-\/]\d{2})/gi,
        route: /(?:from|origin)[\s:]*([A-Za-z\s]+)(?:to|destination)[\s:]*([A-Za-z\s]+)/gi,
        price: /(?:fare|total|price)[\s:]*(?:INR|₹|\$)?[\s]*(\d+[\d,]*\.?\d{0,2})/gi
      }
    };
  }

  parseEmail(email) {
    const bookingType = this.detectBookingType(email);
    
    if (!bookingType) {
      return null;
    }

    const cleanText = this.extractText(email.body);
    const parsedData = {
      id: email.id,
      type: bookingType,
      subject: email.subject,
      from: email.from,
      date: email.date,
      raw: cleanText,
      bookingDetails: this.extractBookingDetails(cleanText, bookingType)
    };

    return parsedData;
  }

  detectBookingType(email) {
    const searchText = `${email.subject} ${email.body}`.toLowerCase();
    
    const scores = {
      flight: 0,
      hotel: 0,
      train: 0
    };

    Object.keys(this.patterns).forEach(type => {
      this.patterns[type].keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = searchText.match(regex);
        if (matches) {
          scores[type] += matches.length;
        }
      });
    });

    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return null;
    }

    return Object.keys(scores).find(key => scores[key] === maxScore);
  }

  extractText(html) {
    const $ = cheerio.load(html);
    $('script, style').remove();
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  extractBookingDetails(text, bookingType) {
    const patterns = this.patterns[bookingType];
    const details = {};

    Object.keys(patterns).forEach(key => {
      if (key === 'keywords') return;

      const pattern = patterns[key];
      const matches = [];
      let match;

      while ((match = pattern.exec(text)) !== null) {
        matches.push(match[1] || match[0]);
      }

      if (matches.length > 0) {
        details[key] = matches.length === 1 ? matches[0] : matches;
      }
    });

    return details;
  }

  parseMultipleEmails(emails) {
    const bookings = {
      flights: [],
      hotels: [],
      trains: [],
      unparsed: []
    };

    emails.forEach(email => {
      const parsed = this.parseEmail(email);
      
      if (parsed) {
        switch (parsed.type) {
          case 'flight':
            bookings.flights.push(parsed);
            break;
          case 'hotel':
            bookings.hotels.push(parsed);
            break;
          case 'train':
            bookings.trains.push(parsed);
            break;
        }
      } else {
        bookings.unparsed.push({
          id: email.id,
          subject: email.subject,
          from: email.from,
          date: email.date
        });
      }
    });

    return bookings;
  }
}

module.exports = new BookingParser();

