const prisma = require('../config/database');
const dayjs = require('dayjs');

class ProfileEnricher {
  async enrichProfile(travelerId) {
    try {
      // Get all bookings and segments for this traveler
      const bookings = await prisma.booking.findMany({
        where: { travelerId },
        include: { segments: true },
        orderBy: { createdAt: 'desc' },
      });

      if (bookings.length === 0) {
        // No bookings yet, create empty profile
        await prisma.travelProfile.upsert({
          where: { travelerId },
          update: { updatedAt: new Date() },
          create: {
            travelerId,
            totalTrips: 0,
            ytdSpend: 0,
            preferredAirlines: [],
            preferredHotels: [],
            commonRoutes: [],
            loyaltyPrograms: {},
          },
        });
        return;
      }

      // Calculate metrics
      const metrics = {
        totalTrips: bookings.length,
        ytdSpend: this.calculateYTDSpend(bookings),
        travelFrequency: this.calculateFrequency(bookings),
        spendTier: this.calculateSpendTier(bookings),
        avgBookingLeadTime: this.calculateLeadTime(bookings),
        preferredAirlines: this.extractPreferredAirlines(bookings),
        preferredHotels: this.extractPreferredHotels(bookings),
        commonRoutes: this.extractCommonRoutes(bookings),
        loyaltyPrograms: this.extractLoyaltyPrograms(bookings),
        lastTripDate: bookings[0]?.createdAt ? new Date(bookings[0].createdAt) : null,
      };

      // Update or create profile
      await prisma.travelProfile.upsert({
        where: { travelerId },
        update: {
          ...metrics,
          updatedAt: new Date(),
        },
        create: {
          travelerId,
          ...metrics,
        },
      });
    } catch (error) {
      console.error('Error enriching profile:', error);
      throw error;
    }
  }

  calculateYTDSpend(bookings) {
    const currentYear = new Date().getFullYear();
    const ytdBookings = bookings.filter(
      (b) => new Date(b.createdAt).getFullYear() === currentYear
    );

    const total = ytdBookings.reduce((sum, booking) => {
      const cost = parseFloat(booking.totalCost || 0);
      return sum + cost;
    }, 0);

    return total;
  }

  calculateFrequency(bookings) {
    if (bookings.length === 0) return 'OCCASIONAL';

    // Calculate trips per month over the last 12 months
    const now = dayjs();
    const twelveMonthsAgo = now.subtract(12, 'month');
    
    const recentBookings = bookings.filter((b) => {
      const bookingDate = dayjs(b.createdAt);
      return bookingDate.isAfter(twelveMonthsAgo);
    });

    const months = Math.max(1, now.diff(twelveMonthsAgo, 'month'));
    const tripsPerMonth = recentBookings.length / months;

    if (tripsPerMonth >= 3) return 'ROAD_WARRIOR';
    if (tripsPerMonth >= 1) return 'REGULAR';
    return 'OCCASIONAL';
  }

  calculateSpendTier(bookings) {
    if (bookings.length === 0) return 'BUDGET';

    const validBookings = bookings.filter((b) => b.totalCost != null);
    if (validBookings.length === 0) return 'STANDARD';

    const totalSpend = validBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalCost || 0),
      0
    );
    const avgSpend = totalSpend / validBookings.length;

    if (avgSpend >= 2000) return 'PREMIUM';
    if (avgSpend >= 500) return 'STANDARD';
    return 'BUDGET';
  }

  calculateLeadTime(bookings) {
    if (bookings.length === 0) return null;

    const leadTimes = [];

    for (const booking of bookings) {
      if (booking.segments && booking.segments.length > 0) {
        const firstSegment = booking.segments[0];
        const bookingDate = dayjs(booking.createdAt);
        const departureDate = dayjs(firstSegment.departureDatetime);
        
        if (departureDate.isAfter(bookingDate)) {
          const leadTime = departureDate.diff(bookingDate, 'day');
          if (leadTime > 0 && leadTime < 365) {
            // Reasonable lead time (less than a year)
            leadTimes.push(leadTime);
          }
        }
      }
    }

    if (leadTimes.length === 0) return null;

    const avgLeadTime = Math.round(
      leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length
    );

    return avgLeadTime;
  }

  extractPreferredAirlines(bookings) {
    const airlineCounts = {};

    bookings.forEach((booking) => {
      if (booking.segments) {
        booking.segments.forEach((segment) => {
          if (segment.airlineCode) {
            const code = segment.airlineCode.toUpperCase();
            airlineCounts[code] = (airlineCounts[code] || 0) + 1;
          }
        });
      }
    });

    // Sort by frequency and return top 5
    const sorted = Object.entries(airlineCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));

    return sorted;
  }

  extractPreferredHotels(bookings) {
    // This would need hotel data from bookings
    // For now, return empty array as we're focusing on flights
    return [];
  }

  extractCommonRoutes(bookings) {
    const routeCounts = {};

    bookings.forEach((booking) => {
      if (booking.segments) {
        booking.segments.forEach((segment) => {
          const route = `${segment.origin}-${segment.destination}`;
          routeCounts[route] = (routeCounts[route] || 0) + 1;
        });
      }
    });

    // Sort by frequency and return top 10
    const sorted = Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([route, count]) => {
        const [origin, destination] = route.split('-');
        return { origin, destination, count };
      });

    return sorted;
  }

  extractLoyaltyPrograms(bookings) {
    // Extract loyalty program information from bookings
    // This would require additional parsing of email content
    // For now, return empty object
    return {};
  }
}

module.exports = new ProfileEnricher();
