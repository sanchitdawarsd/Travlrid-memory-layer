import React, { useState } from 'react';
import './BookingCard.css';

function BookingCard({ booking, type }) {
  const [expanded, setExpanded] = useState(false);

  const getValue = (value) => {
    if (!value) return null;
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const formatRoute = (route) => {
    if (!route) return null;
    if (typeof route === 'object' && route.origin && route.destination) {
      return `${route.origin} → ${route.destination}`;
    }
    if (Array.isArray(route)) {
      return route.map(r => typeof r === 'object' ? `${r.origin} → ${r.destination}` : r).join(', ');
    }
    return route;
  };

  const formatPrice = (price, currency) => {
    if (!price) return null;
    const priceValue = getValue(price);
    if (!priceValue) return null;
    const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹';
    return `${currencySymbol}${priceValue}`;
  };

  const renderDetails = () => {
    const details = booking.bookingDetails || {};
    const currency = details.currency || 'INR';
    
    switch(type) {
      case 'flight':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {(details.bookingId || details.pnr) && (
              <div className="detail-row">
                <span className="detail-label">{details.pnr ? 'PNR' : 'Booking ID'}:</span>
                <span className="detail-value">{getValue(details.bookingId || details.pnr)}</span>
              </div>
            )}
            {details.flightNumber && (
              <div className="detail-row">
                <span className="detail-label">Flight Number:</span>
                <span className="detail-value">{getValue(details.flightNumber)}</span>
              </div>
            )}
            {details.airline && (
              <div className="detail-row">
                <span className="detail-label">Airline:</span>
                <span className="detail-value">{getValue(details.airline)}</span>
              </div>
            )}
            {details.route && (
              <div className="detail-row">
                <span className="detail-label">Route:</span>
                <span className="detail-value">{formatRoute(details.route)}</span>
              </div>
            )}
            {details.date && (
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{getValue(details.date)}</span>
              </div>
            )}
            {details.passenger && (
              <div className="detail-row">
                <span className="detail-label">Passenger:</span>
                <span className="detail-value">{getValue(details.passenger)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
            {booking.confidence && (
              <div className="detail-row">
                <span className="detail-label">Confidence:</span>
                <span className="detail-value">{booking.confidence}%</span>
              </div>
            )}
          </>
        );
      
      case 'hotel':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.bookingId && (
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">{getValue(details.bookingId)}</span>
              </div>
            )}
            {details.propertyName && (
              <div className="detail-row">
                <span className="detail-label">Property:</span>
                <span className="detail-value">{getValue(details.propertyName)}</span>
              </div>
            )}
            {details.location && (
              <div className="detail-row">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{getValue(details.location)}</span>
              </div>
            )}
            {details.checkIn && (
              <div className="detail-row">
                <span className="detail-label">Check-in:</span>
                <span className="detail-value">{getValue(details.checkIn)}</span>
              </div>
            )}
            {details.checkOut && (
              <div className="detail-row">
                <span className="detail-label">Check-out:</span>
                <span className="detail-value">{getValue(details.checkOut)}</span>
              </div>
            )}
            {details.nights && (
              <div className="detail-row">
                <span className="detail-label">Nights:</span>
                <span className="detail-value">{getValue(details.nights)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
            {booking.confidence && (
              <div className="detail-row">
                <span className="detail-label">Confidence:</span>
                <span className="detail-value">{booking.confidence}%</span>
              </div>
            )}
          </>
        );
      
      case 'train':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.pnr && (
              <div className="detail-row">
                <span className="detail-label">PNR:</span>
                <span className="detail-value">{getValue(details.pnr)}</span>
              </div>
            )}
            {details.trainNumber && (
              <div className="detail-row">
                <span className="detail-label">Train Number:</span>
                <span className="detail-value">{getValue(details.trainNumber)}</span>
              </div>
            )}
            {details.route && (
              <div className="detail-row">
                <span className="detail-label">Route:</span>
                <span className="detail-value">{formatRoute(details.route)}</span>
              </div>
            )}
            {details.date && (
              <div className="detail-row">
                <span className="detail-label">Journey Date:</span>
                <span className="detail-value">{getValue(details.date)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Fare:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
            {booking.confidence && (
              <div className="detail-row">
                <span className="detail-label">Confidence:</span>
                <span className="detail-value">{booking.confidence}%</span>
              </div>
            )}
          </>
        );
      
      case 'bus':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.bookingId && (
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">{getValue(details.bookingId)}</span>
              </div>
            )}
            {details.route && (
              <div className="detail-row">
                <span className="detail-label">Route:</span>
                <span className="detail-value">{formatRoute(details.route)}</span>
              </div>
            )}
            {details.date && (
              <div className="detail-row">
                <span className="detail-label">Travel Date:</span>
                <span className="detail-value">{getValue(details.date)}</span>
              </div>
            )}
            {details.seat && (
              <div className="detail-row">
                <span className="detail-label">Seat:</span>
                <span className="detail-value">{getValue(details.seat)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
          </>
        );
      
      case 'cab':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.bookingId && (
              <div className="detail-row">
                <span className="detail-label">Trip ID:</span>
                <span className="detail-value">{getValue(details.bookingId)}</span>
              </div>
            )}
            {details.pickup && (
              <div className="detail-row">
                <span className="detail-label">Pickup:</span>
                <span className="detail-value">{getValue(details.pickup)}</span>
              </div>
            )}
            {details.drop && (
              <div className="detail-row">
                <span className="detail-label">Drop:</span>
                <span className="detail-value">{getValue(details.drop)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Fare:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
          </>
        );
      
      case 'rental':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.bookingId && (
              <div className="detail-row">
                <span className="detail-label">Order ID:</span>
                <span className="detail-value">{getValue(details.bookingId)}</span>
              </div>
            )}
            {details.vehicle && (
              <div className="detail-row">
                <span className="detail-label">Vehicle:</span>
                <span className="detail-value">{getValue(details.vehicle)}</span>
              </div>
            )}
            {details.pickupDate && (
              <div className="detail-row">
                <span className="detail-label">Pickup Date:</span>
                <span className="detail-value">{getValue(details.pickupDate)}</span>
              </div>
            )}
            {details.returnDate && (
              <div className="detail-row">
                <span className="detail-label">Return Date:</span>
                <span className="detail-value">{getValue(details.returnDate)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
          </>
        );
      
      case 'event':
        return (
          <>
            {booking.platform && booking.platform !== 'Unknown' && (
              <div className="detail-row">
                <span className="detail-label">Platform:</span>
                <span className="detail-value">{booking.platform}</span>
              </div>
            )}
            {details.bookingId && (
              <div className="detail-row">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value">{getValue(details.bookingId)}</span>
              </div>
            )}
            {details.eventName && (
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{getValue(details.eventName)}</span>
              </div>
            )}
            {details.venue && (
              <div className="detail-row">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">{getValue(details.venue)}</span>
              </div>
            )}
            {details.date && (
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{getValue(details.date)}</span>
              </div>
            )}
            {details.time && (
              <div className="detail-row">
                <span className="detail-label">Time:</span>
                <span className="detail-value">{getValue(details.time)}</span>
              </div>
            )}
            {details.price && (
              <div className="detail-row">
                <span className="detail-label">Price:</span>
                <span className="detail-value">{formatPrice(details.price, currency)}</span>
              </div>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`booking-card ${expanded ? 'expanded' : ''}`}>
      <div className="booking-header" onClick={() => setExpanded(!expanded)}>
        <div className="booking-info">
          <h3 className="booking-subject">{booking.subject}</h3>
          <div className="booking-meta">
            {booking.platform && booking.platform !== 'Unknown' && (
              <span className="booking-platform">{booking.platform}</span>
            )}
            <span className="booking-from">From: {booking.from}</span>
            <span className="booking-date">{new Date(booking.date).toLocaleDateString()}</span>
            {booking.confidence && (
              <span className="booking-confidence">Confidence: {booking.confidence}%</span>
            )}
          </div>
        </div>
        <button className="expand-button">
          <svg 
            className={`expand-icon ${expanded ? 'rotated' : ''}`} 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {expanded && (
        <div className="booking-details">
          {renderDetails()}
          
          {Object.keys(booking.bookingDetails || {}).length === 0 && (
            <p className="no-details">No specific booking details could be extracted.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingCard;

