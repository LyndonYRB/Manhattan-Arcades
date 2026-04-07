import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = ({ selectedArcade }) => {

  // Function to render stars based on the rating value
  const renderStars = (rating) => {
    const totalStars = 5;
    return (
      <div className="stars">
        {[...Array(totalStars)].map((_, index) => (
          <span key={index} className={index < Math.round(rating) ? 'filled-star' : 'empty-star'}>
            &#9733;
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`home-page-content${selectedArcade ? ' has-hero-image' : ''}`}
      style={{
        backgroundImage: selectedArcade
          ? `url(/assets/arcade-images/${selectedArcade.id}-bg.jpg)`
          : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center top', // Adjust this value as needed
      }}
    >
      {selectedArcade ? (
        <div className="arcade-info">
          <p className="arcade-eyebrow">Featured Venue</p>
          <h2>{selectedArcade.name}</h2>
          <p className="arcade-summary">
            Explore venue details, hours, amenities, and community reviews in one focused browsing experience.
          </p>
          <p className="arcade-address">{selectedArcade.address}</p>
          
          {/* Display Average Rating in Stars and Numeric */}
          <div className="average-rating">
            <p>Average rating: {selectedArcade.average_rating} / 5</p>
            {renderStars(selectedArcade.average_rating)}
          </div>

          <Link
            to={`/arcades/${selectedArcade.id}`}
            className="more-info"
            aria-label={`View details for ${selectedArcade.name}`}
          >
            View Details
          </Link>
        </div>
      ) : (
        <section className="home-empty-state" aria-labelledby="home-title">
          <p className="home-eyebrow">Location-Based Discovery App</p>
          <h2 id="home-title">Manhattan Arcades</h2>
          <p className="home-description">
            Manhattan Arcades is a location-based discovery app that helps users explore arcade venues across Manhattan through a cleaner, more focused browsing experience.
          </p>
          <p className="home-supporting-copy">
            Browse venues from the sidebar to compare locations, hours, amenities, and reviews without losing context.
          </p>
        </section>
      )}
    </div>
  );
};

export default HomePage;
