import React from 'react';
import { Link } from 'react-router-dom';
import Map from '../components/Map';
import '../styles/HomePage.css';

const HomePage = ({ arcades, selectedArcade, onSelectArcade }) => {

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
      <div className="home-layout">
        <section className="venue-panel" aria-labelledby={selectedArcade ? 'selected-venue-title' : 'home-title'}>
          {selectedArcade ? (
            <div className="arcade-info">
              <p className="arcade-eyebrow">Featured Venue</p>
              <h2 id="selected-venue-title">{selectedArcade.name}</h2>
              <p className="arcade-summary">
                Explore venue details, hours, amenities, and community reviews in one focused browsing experience.
              </p>
              <p className="arcade-address">{selectedArcade.address}</p>

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
            <div className="home-empty-state">
              <p className="home-eyebrow">Full-Stack Geospatial Discovery Platform</p>
              <h2 id="home-title">Manhattan Arcades</h2>
              <p className="home-description">
                Browse arcade venues across Manhattan through a PostGIS-backed dataset, interactive map markers, and detail pages with hours, amenities, and reviews.
              </p>
              <p className="home-supporting-copy">
                Select a venue from the sidebar or map to compare locations without losing context.
              </p>
            </div>
          )}
        </section>
        <Map
          arcades={arcades}
          selectedArcade={selectedArcade}
          onSelectArcade={onSelectArcade}
        />
      </div>
    </div>
  );
};

export default HomePage;
