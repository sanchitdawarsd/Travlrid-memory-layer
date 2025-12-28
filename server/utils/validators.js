const Joi = require('joi');
const dayjs = require('dayjs');

/**
 * Travlr ID Core Schema Validation Rules
 */

// FLT-001: Arrival datetime must be after departure datetime
const validateFlightTiming = (departure, arrival) => {
  if (!departure || !arrival) {
    throw new Error('FLT-001: Departure and arrival datetimes are required');
  }
  
  const dep = dayjs(departure);
  const arr = dayjs(arrival);
  
  if (arr.isBefore(dep) || arr.isSame(dep)) {
    throw new Error('FLT-001: Arrival datetime must be after departure datetime');
  }
  
  return true;
};

// FLT-002: Origin and destination must be different
const validateRoute = (origin, destination) => {
  if (!origin || !destination) {
    throw new Error('FLT-002: Origin and destination are required');
  }
  
  if (origin.toUpperCase() === destination.toUpperCase()) {
    throw new Error('FLT-002: Origin and destination must be different');
  }
  
  return true;
};

// Validate IATA code format (3 letters)
const validateIATACode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const iataRegex = /^[A-Z]{3}$/;
  return iataRegex.test(code.toUpperCase());
};

// Validate airline code (2-3 letters)
const validateAirlineCode = (code) => {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  const airlineRegex = /^[A-Z]{2,3}$/;
  return airlineRegex.test(code.toUpperCase());
};

// Validate booking reference format
const validateBookingReference = (ref) => {
  if (!ref || typeof ref !== 'string') {
    return false;
  }
  
  // Booking references are typically 6-10 alphanumeric characters
  const refRegex = /^[A-Z0-9]{6,10}$/;
  return refRegex.test(ref.toUpperCase());
};

// Validate email format
const validateEmail = (email) => {
  const emailSchema = Joi.string().email().required();
  const { error } = emailSchema.validate(email);
  return !error;
};

// Validate flight segment
const validateFlightSegment = (segment) => {
  const errors = [];
  
  if (!validateIATACode(segment.origin)) {
    errors.push('Invalid origin IATA code');
  }
  
  if (!validateIATACode(segment.destination)) {
    errors.push('Invalid destination IATA code');
  }
  
  try {
    validateRoute(segment.origin, segment.destination);
  } catch (error) {
    errors.push(error.message);
  }
  
  try {
    validateFlightTiming(segment.departure_datetime, segment.arrival_datetime);
  } catch (error) {
    errors.push(error.message);
  }
  
  if (segment.airline_code && !validateAirlineCode(segment.airline_code)) {
    errors.push('Invalid airline code');
  }
  
  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }
  
  return true;
};

// Validate booking data structure
const validateBookingData = (data) => {
  const schema = Joi.object({
    booking_type: Joi.string().valid('flight', 'hotel', 'car').required(),
    booking_reference: Joi.string().optional(),
    traveler: Joi.object({
      email: Joi.string().email().required(),
      full_name: Joi.string().required(),
    }).required(),
    segments: Joi.array().items(
      Joi.object({
        airline_code: Joi.string().optional(),
        flight_number: Joi.string().optional(),
        origin: Joi.string().length(3).required(),
        destination: Joi.string().length(3).required(),
        departure_datetime: Joi.date().iso().required(),
        arrival_datetime: Joi.date().iso().required(),
        cabin_class: Joi.string().valid('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST').optional(),
        price: Joi.number().positive().optional(),
      })
    ).min(1).when('booking_type', {
      is: 'flight',
      then: Joi.required(),
    }),
    total_cost: Joi.number().positive().optional(),
    currency: Joi.string().length(3).optional(),
  });
  
  const { error, value } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    throw new Error(`Validation error: ${error.details.map(d => d.message).join(', ')}`);
  }
  
  // Validate each segment
  if (value.segments) {
    value.segments.forEach((segment, index) => {
      try {
        validateFlightSegment(segment);
      } catch (err) {
        throw new Error(`Segment ${index + 1}: ${err.message}`);
      }
    });
  }
  
  return value;
};

module.exports = {
  validateFlightTiming,
  validateRoute,
  validateIATACode,
  validateAirlineCode,
  validateBookingReference,
  validateEmail,
  validateFlightSegment,
  validateBookingData,
};
