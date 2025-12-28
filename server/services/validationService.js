const {
  validateFlightTiming,
  validateRoute,
  validateIATACode,
  validateAirlineCode,
  validateBookingReference,
  validateEmail,
  validateFlightSegment,
  validateBookingData,
} = require('../utils/validators');

/**
 * Travlr ID Validation Service
 * Implements all validation rules from Travlr ID Core Schema v1.0
 */
class ValidationService {
  /**
   * Validate a complete booking against Travlr ID rules
   */
  validateBooking(bookingData) {
    return validateBookingData(bookingData);
  }

  /**
   * Validate flight segment
   */
  validateSegment(segment) {
    return validateFlightSegment(segment);
  }

  /**
   * Validate traveler email
   */
  validateTravelerEmail(email) {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    return true;
  }

  /**
   * Validate IATA code
   */
  validateIATA(code) {
    if (!validateIATACode(code)) {
      throw new Error(`Invalid IATA code: ${code}. Must be 3 uppercase letters.`);
    }
    return true;
  }

  /**
   * Validate airline code
   */
  validateAirline(code) {
    if (code && !validateAirlineCode(code)) {
      throw new Error(`Invalid airline code: ${code}. Must be 2-3 uppercase letters.`);
    }
    return true;
  }

  /**
   * Validate booking reference
   */
  validateReference(ref) {
    if (ref && !validateBookingReference(ref)) {
      throw new Error(`Invalid booking reference: ${ref}. Must be 6-10 alphanumeric characters.`);
    }
    return true;
  }

  /**
   * Validate route (origin and destination)
   */
  validateRoutePair(origin, destination) {
    this.validateIATA(origin);
    this.validateIATA(destination);
    validateRoute(origin, destination);
    return true;
  }

  /**
   * Validate flight timing
   */
  validateTiming(departure, arrival) {
    validateFlightTiming(departure, arrival);
    return true;
  }

  /**
   * Comprehensive validation of booking before database insertion
   */
  async validateBookingForInsert(bookingData) {
    const errors = [];

    try {
      // Validate overall structure
      this.validateBooking(bookingData);
    } catch (error) {
      errors.push(error.message);
    }

    // Validate traveler
    try {
      this.validateTravelerEmail(bookingData.traveler?.email);
    } catch (error) {
      errors.push(`Traveler validation: ${error.message}`);
    }

    // Validate segments
    if (bookingData.segments && Array.isArray(bookingData.segments)) {
      bookingData.segments.forEach((segment, index) => {
        try {
          this.validateSegment(segment);
        } catch (error) {
          errors.push(`Segment ${index + 1}: ${error.message}`);
        }
      });
    }

    // Validate booking reference if present
    if (bookingData.booking_reference) {
      try {
        this.validateReference(bookingData.booking_reference);
      } catch (error) {
        errors.push(error.message);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }
}

module.exports = new ValidationService();
