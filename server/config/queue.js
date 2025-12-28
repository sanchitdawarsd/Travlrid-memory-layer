const Queue = require('bull');
const Redis = require('ioredis');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
};

const createQueue = (queueName) => {
  return new Queue(queueName, {
    createClient: (type) => {
      switch (type) {
        case 'client':
          return new Redis(redisConfig);
        case 'subscriber':
          return new Redis(redisConfig);
        default:
          return new Redis(redisConfig);
      }
    },
  });
};

// Email processing queue
const emailQueue = createQueue('email-processing');

// Profile update queue
const profileQueue = createQueue('profile-update');

module.exports = {
  emailQueue,
  profileQueue,
  createQueue,
};
