const prisma = require('../config/database');
const profileEnricher = require('../services/profileEnricher');

class ProfileController {
  /**
   * Get travel profile by traveler ID
   */
  async getProfile(req, res) {
    try {
      const { travelerId } = req.params;

      const profile = await prisma.travelProfile.findUnique({
        where: { travelerId },
        include: {
          traveler: {
            select: {
              id: true,
              email: true,
              fullName: true,
              company: true,
              department: true,
            },
          },
        },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
    }
  }

  /**
   * Trigger profile enrichment
   */
  async enrichProfile(req, res) {
    try {
      const { travelerId } = req.params;

      // Verify traveler exists
      const traveler = await prisma.traveler.findUnique({
        where: { id: travelerId },
      });

      if (!traveler) {
        return res.status(404).json({ error: 'Traveler not found' });
      }

      // Enrich profile
      await profileEnricher.enrichProfile(travelerId);

      // Fetch updated profile
      const profile = await prisma.travelProfile.findUnique({
        where: { travelerId },
        include: {
          traveler: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      res.json({
        message: 'Profile enriched successfully',
        profile,
      });
    } catch (error) {
      console.error('Error enriching profile:', error);
      res.status(500).json({ error: 'Failed to enrich profile', details: error.message });
    }
  }

  /**
   * Get travel statistics
   */
  async getTravelStats(req, res) {
    try {
      const { travelerId } = req.params;

      const [profile, bookings] = await Promise.all([
        prisma.travelProfile.findUnique({
          where: { travelerId },
        }),
        prisma.booking.findMany({
          where: { travelerId },
          include: { segments: true },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Calculate additional stats
      const stats = {
        totalTrips: bookings.length,
        totalSpend: bookings.reduce((sum, b) => sum + parseFloat(b.totalCost || 0), 0),
        avgSpendPerTrip: bookings.length > 0
          ? bookings.reduce((sum, b) => sum + parseFloat(b.totalCost || 0), 0) / bookings.length
          : 0,
        ytdTrips: bookings.filter(
          (b) => new Date(b.createdAt).getFullYear() === new Date().getFullYear()
        ).length,
        ytdSpend: parseFloat(profile.ytdSpend || 0),
        travelFrequency: profile.travelFrequency,
        spendTier: profile.spendTier,
        preferredAirlines: profile.preferredAirlines,
        commonRoutes: profile.commonRoutes,
        lastTripDate: profile.lastTripDate,
        avgBookingLeadTime: profile.avgBookingLeadTime,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching travel stats:', error);
      res.status(500).json({ error: 'Failed to fetch travel stats', details: error.message });
    }
  }
}

module.exports = new ProfileController();
