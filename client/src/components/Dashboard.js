import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import BookingCard from './BookingCard';

function Dashboard({ userEmail, provider, onLogout }) {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/bookings/fetch', {
        timeout: 90000, // 90 second timeout
      });
      setBookings(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        setError('Cannot connect to server. Please make sure the server is running on port 5001.');
      } else if (error.response) {
        setError(`Server error: ${error.response.data?.error || error.response.statusText}`);
      } else {
        setError('Failed to fetch bookings. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!bookings) return;
    
    const dataStr = JSON.stringify(bookings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `travel_bookings_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Travel Bookings</h1>
            <p className="user-info">
              <span className="provider-badge">{provider}</span>
              {userEmail}
            </p>
          </div>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {!bookings ? (
          <div className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-icon">📧</div>
              <h2>Ready to Extract Your Travel Bookings</h2>
              <p>Click the button below to scan your emails for flight, hotel, and train bookings.</p>
              <button 
                className="fetch-button"
                onClick={fetchBookings}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Scanning Emails...
                  </>
                ) : (
                  <>
                    <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M21 12L21 4M21 4L13 4M21 4L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Scan My Emails
                  </>
                )}
              </button>
              {error && <p className="error-message">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="results-section">
            <div className="results-header">
              <div className="stats-container">
                <div className="stat-card">
                  <span className="stat-icon">✈️</span>
                  <div className="stat-content">
                    <h3>{stats?.flights || 0}</h3>
                    <p>Flights</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🏨</span>
                  <div className="stat-content">
                    <h3>{stats?.hotels || 0}</h3>
                    <p>Hotels</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🚆</span>
                  <div className="stat-content">
                    <h3>{stats?.trains || 0}</h3>
                    <p>Trains</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🚌</span>
                  <div className="stat-content">
                    <h3>{stats?.buses || 0}</h3>
                    <p>Buses</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🚕</span>
                  <div className="stat-content">
                    <h3>{stats?.cabs || 0}</h3>
                    <p>Cabs</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🚗</span>
                  <div className="stat-content">
                    <h3>{stats?.rentals || 0}</h3>
                    <p>Rentals</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">🎫</span>
                  <div className="stat-content">
                    <h3>{stats?.events || 0}</h3>
                    <p>Events</p>
                  </div>
                </div>
                <div className="stat-card">
                  <span className="stat-icon">📧</span>
                  <div className="stat-content">
                    <h3>{stats?.totalEmails || 0}</h3>
                    <p>Total Emails</p>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="refresh-button" onClick={fetchBookings} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button className="download-button" onClick={downloadJSON}>
                  <svg className="button-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Download JSON
                </button>
              </div>
            </div>

            <div className="bookings-container">
              {bookings.flights.length > 0 && (
                <div className="booking-section">
                  <h2>✈️ Flight Bookings</h2>
                  <div className="booking-grid">
                    {bookings.flights.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="flight" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.hotels.length > 0 && (
                <div className="booking-section">
                  <h2>🏨 Hotel Reservations</h2>
                  <div className="booking-grid">
                    {bookings.hotels.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="hotel" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.trains.length > 0 && (
                <div className="booking-section">
                  <h2>🚆 Train Tickets</h2>
                  <div className="booking-grid">
                    {bookings.trains.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="train" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.buses.length > 0 && (
                <div className="booking-section">
                  <h2>🚌 Bus Bookings</h2>
                  <div className="booking-grid">
                    {bookings.buses.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="bus" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.cabs.length > 0 && (
                <div className="booking-section">
                  <h2>🚕 Cab Rides</h2>
                  <div className="booking-grid">
                    {bookings.cabs.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="cab" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.rentals.length > 0 && (
                <div className="booking-section">
                  <h2>🚗 Vehicle Rentals</h2>
                  <div className="booking-grid">
                    {bookings.rentals.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="rental" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.events.length > 0 && (
                <div className="booking-section">
                  <h2>🎫 Event Tickets</h2>
                  <div className="booking-grid">
                    {bookings.events.map((booking, index) => (
                      <BookingCard key={booking.id || index} booking={booking} type="event" />
                    ))}
                  </div>
                </div>
              )}

              {bookings.flights.length === 0 && bookings.hotels.length === 0 && bookings.trains.length === 0 && 
               bookings.buses.length === 0 && bookings.cabs.length === 0 && bookings.rentals.length === 0 && 
               bookings.events.length === 0 && (
                <div className="no-results">
                  <p>No travel bookings found in your emails.</p>
                  <p className="no-results-hint">Try booking a trip and check back!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

