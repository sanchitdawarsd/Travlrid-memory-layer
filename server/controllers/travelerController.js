const prisma = require('../config/database');

class TravelerController {
  /**
   * Get traveler by ID with profile and recent bookings
   */
  async getTravelerById(req, res) {
    try {
      const { id } = req.params;

      const traveler = await prisma.traveler.findUnique({
        where: { id },
        include: {
          profile: true,
          bookings: {
            include: {
              segments: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          consents: {
            where: {
              revokedAt: null,
            },
            orderBy: { grantedAt: 'desc' },
          },
        },
      });

      if (!traveler) {
        return res.status(404).json({ error: 'Traveler not found' });
      }

      res.json(traveler);
    } catch (error) {
      console.error('Error fetching traveler:', error);
      res.status(500).json({ error: 'Failed to fetch traveler', details: error.message });
    }
  }

  /**
   * Search travelers by email or company
   */
  async searchTravelers(req, res) {
    try {
      const { email, company, department, limit = 50, offset = 0 } = req.query;

      const where = {};
      
      if (email) {
        where.email = { contains: email, mode: 'insensitive' };
      }
      
      if (company) {
        where.company = { contains: company, mode: 'insensitive' };
      }
      
      if (department) {
        where.department = { contains: department, mode: 'insensitive' };
      }

      const [travelers, total] = await Promise.all([
        prisma.traveler.findMany({
          where,
          include: {
            profile: true,
          },
          take: parseInt(limit),
          skip: parseInt(offset),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.traveler.count({ where }),
      ]);

      res.json({
        travelers,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error('Error searching travelers:', error);
      res.status(500).json({ error: 'Failed to search travelers', details: error.message });
    }
  }

  /**
   * Get traveler by email
   */
  async getTravelerByEmail(req, res) {
    try {
      const { email } = req.params;

      const traveler = await prisma.traveler.findUnique({
        where: { email },
        include: {
          profile: true,
          bookings: {
            include: { segments: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!traveler) {
        return res.status(404).json({ error: 'Traveler not found' });
      }

      res.json(traveler);
    } catch (error) {
      console.error('Error fetching traveler by email:', error);
      res.status(500).json({ error: 'Failed to fetch traveler', details: error.message });
    }
  }

  /**
   * Create or update traveler
   */
  async upsertTraveler(req, res) {
    try {
      const { email, fullName, company, department, dateOfBirth } = req.body;

      if (!email || !fullName) {
        return res.status(400).json({ error: 'Email and fullName are required' });
      }

      const traveler = await prisma.traveler.upsert({
        where: { email },
        update: {
          fullName,
          company,
          department,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          updatedAt: new Date(),
        },
        create: {
          email,
          fullName,
          company,
          department,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        },
      });

      res.json(traveler);
    } catch (error) {
      console.error('Error upserting traveler:', error);
      res.status(500).json({ error: 'Failed to upsert traveler', details: error.message });
    }
  }
}

module.exports = new TravelerController();
