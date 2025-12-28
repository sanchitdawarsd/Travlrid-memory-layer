const openai = require('../config/openai');
const prisma = require('../config/database');
const { validateBookingData } = require('../utils/validators');
const { normalizeEmailContent } = require('../utils/parsers');
const { profileQueue } = require('../config/queue');

class EmailExtractor {
  constructor() {
    this.openai = openai;
  }

  async extractBookingData(emailContent) {
    const prompt = `Extract travel booking information from this email. Follow the Travlr ID Core Schema v1.0 format.

Email content:
${emailContent}

Return a JSON object with the following structure:
{
  "booking_type": "flight|hotel|car",
  "booking_reference": "string (optional)",
  "traveler": {
    "email": "string (required)",
    "full_name": "string (required)"
  },
  "segments": [
    {
      "airline_code": "string (2-3 letter airline code, optional)",
      "flight_number": "string (optional)",
      "origin": "string (3 letter IATA code, required)",
      "destination": "string (3 letter IATA code, required)",
      "departure_datetime": "ISO 8601 datetime string (required)",
      "arrival_datetime": "ISO 8601 datetime string (required)",
      "cabin_class": "ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST (optional)",
      "price": number (optional)
    }
  ],
  "total_cost": number (optional),
  "currency": "string (3 letter currency code, optional)"
}

Important rules:
- Origin and destination must be 3-letter IATA codes (e.g., "JFK", "LAX", "LHR")
- Arrival datetime must be after departure datetime
- Origin and destination must be different
- If no segments are found, return an empty array
- Extract dates in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
- If booking_type is not "flight", segments can be empty or contain different structure`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a travel booking data extraction expert. Extract structured booking information from emails and return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0].message.content;
      const bookingData = JSON.parse(content);

      // Validate the extracted data
      return validateBookingData(bookingData);
    } catch (error) {
      console.error('Error extracting booking data:', error);
      throw new Error(`Failed to extract booking data: ${error.message}`);
    }
  }

  async processEmail(emailData) {
    try {
      // Normalize email content
      const normalizedEmail = normalizeEmailContent(emailData);
      
      // Extract structured data using GPT-4
      const bookingData = await this.extractBookingData(normalizedEmail.body);
      
      // Skip if no valid booking data extracted
      if (!bookingData || !bookingData.traveler || !bookingData.traveler.email) {
        throw new Error('No valid traveler information found in email');
      }

      // Create or update traveler
      const traveler = await prisma.traveler.upsert({
        where: { email: bookingData.traveler.email },
        update: {
          fullName: bookingData.traveler.full_name,
          updatedAt: new Date(),
        },
        create: {
          email: bookingData.traveler.email,
          fullName: bookingData.traveler.full_name,
        },
      });

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          travelerId: traveler.id,
          bookingReference: bookingData.booking_reference || null,
          status: 'CONFIRMED',
          sourceEmailId: emailData.id || emailData.messageId || null,
          rawEmailContent: normalizedEmail.raw,
          totalCost: bookingData.total_cost ? parseFloat(bookingData.total_cost) : null,
          currency: bookingData.currency || null,
        },
      });

      // Create flight segments if available
      if (bookingData.segments && Array.isArray(bookingData.segments) && bookingData.segments.length > 0) {
        for (const segment of bookingData.segments) {
          await prisma.flightSegment.create({
            data: {
              bookingId: booking.id,
              airlineCode: segment.airline_code ? segment.airline_code.toUpperCase() : null,
              flightNumber: segment.flight_number || null,
              origin: segment.origin.toUpperCase(),
              destination: segment.destination.toUpperCase(),
              departureDatetime: new Date(segment.departure_datetime),
              arrivalDatetime: new Date(segment.arrival_datetime),
              cabinClass: segment.cabin_class || null,
              price: segment.price ? parseFloat(segment.price) : null,
              status: 'CONFIRMED',
            },
          });
        }
      }

      // Queue profile enrichment job
      await profileQueue.add('enrich-profile', {
        travelerId: traveler.id,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      return {
        booking,
        traveler,
        segmentsCount: bookingData.segments?.length || 0,
      };
    } catch (error) {
      console.error('Email processing error:', error);
      throw error;
    }
  }

  async processEmailWithQueue(emailData) {
    // Add email to queue for async processing
    const { emailQueue } = require('../config/queue');
    
    await emailQueue.add('process-email', {
      emailData,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return { queued: true, emailId: emailData.id || emailData.messageId };
  }
}

module.exports = new EmailExtractor();
