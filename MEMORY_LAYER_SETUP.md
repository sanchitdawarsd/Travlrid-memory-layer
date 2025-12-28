# Travlr Memory Layer Setup Guide

This guide will help you set up the PostgreSQL memory layer for the email scraper.

## Prerequisites

1. **PostgreSQL 15+** installed and running
2. **Redis** installed and running (for Bull queue)
3. **Node.js 18+** installed
4. **OpenAI API Key** (for GPT-4 email extraction)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update your `.env` file with the following:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/travlr_memory?schema=public"

# Redis Configuration (for Bull queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE travlr_memory;

# Exit psql
\q
```

### 4. Run Database Migrations

```bash
# Create and apply migrations
npm run migrate

# Or if you want to deploy existing migrations
npm run migrate:deploy
```

### 5. Start Redis Server

```bash
# On macOS with Homebrew
brew services start redis

# On Linux
sudo systemctl start redis

# Or run directly
redis-server
```

### 6. Start the Application

```bash
# Start the main server
npm run server

# In a separate terminal, start the email processor worker
npm run worker
```

## API Endpoints

### Travelers API

- `GET /api/travelers` - Search travelers
- `GET /api/travelers/:id` - Get traveler by ID
- `GET /api/travelers/email/:email` - Get traveler by email
- `POST /api/travelers` - Create or update traveler

### Bookings API

- `GET /api/bookings-memory` - Get all bookings
- `GET /api/bookings-memory/:id` - Get booking by ID
- `GET /api/bookings-memory/traveler/:travelerId` - Get bookings for a traveler
- `PATCH /api/bookings-memory/:id/status` - Update booking status

### Profiles API

- `GET /api/profiles/:travelerId` - Get travel profile
- `POST /api/profiles/:travelerId/enrich` - Trigger profile enrichment
- `GET /api/profiles/:travelerId/stats` - Get travel statistics

### Email Processing API

- `POST /api/emails/process` - Process email synchronously
- `POST /api/emails/queue` - Queue email for async processing
- `GET /api/emails/queue/status` - Get email queue status

## Database Schema

The memory layer uses the following main tables:

- **travelers** - Traveler information
- **bookings** - Booking records
- **flight_segments** - Flight segment details
- **travel_profiles** - Enriched travel profiles with patterns
- **email_queue** - Email processing queue status
- **consent_records** - GDPR consent management

## Integration with Existing Routes

The memory layer is automatically integrated with the existing email fetching routes:

- When you call `GET /api/bookings/fetch`, emails are:
  1. Parsed using the existing regex parser (legacy)
  2. Saved to JSON files (legacy)
  3. **Queued for GPT-4 processing and database storage (new)**

## Running Migrations

```bash
# Create a new migration
npm run migrate

# Apply migrations in production
npm run migrate:deploy

# Open Prisma Studio to view data
npm run prisma:studio
```

## Worker Process

The email processor worker (`npm run worker`) processes emails from the Bull queue:

- Extracts booking data using GPT-4
- Validates against Travlr ID schema
- Stores in PostgreSQL
- Triggers profile enrichment

Make sure to run this worker in production for async email processing.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `psql -l | grep travlr_memory`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in `.env`

### OpenAI API Issues

- Verify OPENAI_API_KEY is set correctly
- Check API quota and billing

## Production Deployment

For Railway deployment:

1. Add PostgreSQL addon
2. Add Redis addon
3. Set environment variables in Railway dashboard
4. Run migrations: `npm run migrate:deploy`
5. Start server and worker processes
