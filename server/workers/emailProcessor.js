require('dotenv').config();
const { emailQueue, profileQueue } = require('../config/queue');
const emailExtractor = require('../services/emailExtractor');
const prisma = require('../config/database');

/**
 * Email Processing Worker
 * Processes emails from the Bull queue asynchronously
 */
emailQueue.process('process-email', async (job) => {
  const { emailData } = job.data;
  
  console.log(`Processing email: ${emailData.id || emailData.messageId}`);

  try {
    // Update queue status to processing
    if (emailData.id || emailData.messageId) {
      await prisma.emailQueue.updateMany({
        where: {
          emailId: emailData.id || emailData.messageId,
        },
        data: {
          processingStatus: 'PROCESSING',
        },
      });
    }

    // Process the email
    const result = await emailExtractor.processEmail(emailData);

    // Update queue status to completed
    if (emailData.id || emailData.messageId) {
      await prisma.emailQueue.updateMany({
        where: {
          emailId: emailData.id || emailData.messageId,
        },
        data: {
          processingStatus: 'COMPLETED',
          processedAt: new Date(),
        },
      });
    }

    console.log(`Email processed successfully: ${result.booking.id}`);
    return result;
  } catch (error) {
    console.error(`Error processing email ${emailData.id || emailData.messageId}:`, error);

    // Update queue status to failed
    if (emailData.id || emailData.messageId) {
      await prisma.emailQueue.updateMany({
        where: {
          emailId: emailData.id || emailData.messageId,
        },
        data: {
          processingStatus: 'FAILED',
          errorMessage: error.message,
          processedAt: new Date(),
        },
      });
    }

    throw error;
  }
});

/**
 * Profile Update Worker
 * Enriches travel profiles asynchronously
 */
profileQueue.process('enrich-profile', async (job) => {
  const { travelerId } = job.data;
  
  console.log(`Enriching profile for traveler: ${travelerId}`);

  try {
    const profileEnricher = require('../services/profileEnricher');
    await profileEnricher.enrichProfile(travelerId);
    
    console.log(`Profile enriched successfully for traveler: ${travelerId}`);
    return { success: true, travelerId };
  } catch (error) {
    console.error(`Error enriching profile for traveler ${travelerId}:`, error);
    throw error;
  }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result.booking?.id);
});

emailQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error.message);
});

profileQueue.on('completed', (job, result) => {
  console.log(`Profile job ${job.id} completed for traveler:`, result.travelerId);
});

profileQueue.on('failed', (job, error) => {
  console.error(`Profile job ${job.id} failed:`, error.message);
});

console.log('Email processor worker started');
console.log('Waiting for jobs...');

// Keep the process alive
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing queues...');
  await emailQueue.close();
  await profileQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});
