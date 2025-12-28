const prisma = require('../config/database');

class BookingController {
  /**
   * Get booking by ID
   */
  async getBookingById(req, res) {
    try {
      const { id } = req.params;

      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          traveler: {
            include: {
              profile: true,
            },
          },
          segments: {
            orderBy: { departureDatetime: 'asc' },
          },
        },
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json(booking);
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({ error: 'Failed to fetch booking', details: error.message });
    }
  }

  /**
   * Get bookings for a traveler
   */
  async getTravelerBookings(req, res) {
    try {
      const { travelerId } = req.params;
      const { status, limit = 50, offset = 0 } = req.query;

      const where = { travelerId };
      
      if (status) {
        where.status = status.toUpperCase();
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            segments: {
              orderBy: { departureDatetime: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        bookings,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error('Error fetching traveler bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
  }

  /**
   * Get all bookings with filters
   */
  async getAllBookings(req, res) {
    try {
      const { status, travelerEmail, limit = 50, offset = 0 } = req.query;

      const where = {};
      
      if (status) {
        where.status = status.toUpperCase();
      }
      
      if (travelerEmail) {
        where.traveler = {
          email: { contains: travelerEmail, mode: 'insensitive' },
        };
      }

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where,
          include: {
            traveler: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
            segments: {
              orderBy: { departureDatetime: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: parseInt(limit),
          skip: parseInt(offset),
        }),
        prisma.booking.count({ where }),
      ]);

      res.json({
        bookings,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'FAILED'];
      
      if (!validStatuses.includes(status?.toUpperCase())) {
        return res.status(400).json({ 
          error: 'Invalid status', 
          validStatuses 
        });
      }

      const booking = await prisma.booking.update({
        where: { id },
        data: {
          status: status.toUpperCase(),
          updatedAt: new Date(),
        },
        include: {
          traveler: true,
          segments: true,
        },
      });

      res.json(booking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ error: 'Failed to update booking', details: error.message });
    }
  }
}

module.exports = new BookingController();
