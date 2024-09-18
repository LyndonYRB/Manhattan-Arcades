import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = ({ selectedArcade }) => {
  // Function to render stars based on the rating value
  const renderStars = (rating) => {
    const totalStars = 5;
    const roundedRating = Math.round(rating); // Round the rating to the nearest whole number
    return (
      <div className="stars">
        {[...Array(totalStars)].map((_, index) => (
          <span
            key={index}
            className={index < roundedRating ? 'filled-star' : 'empty-star'}
          >
            &#9733;
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="home-page-content"
      style={{
        backgroundImage: selectedArcade
          ? `url(/assets/arcade-images/${selectedArcade.id}-bg.jpg)`
          : `url(/assets/default-bg.jpg)`, // Use a default background image if none is selected
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
      }}
    >
      {selectedArcade ? (
        <div className="arcade-info">
          <h2>{selectedArcade.name}</h2>
          <p>{selectedArcade.address}</p>

          {/* Display Average Rating in Stars and Numeric */}
          <div className="average-rating">
            <p>Average Rating: {selectedArcade.average_rating ? selectedArcade.average_rating : 'No rating yet'} stars</p>
            {renderStars(selectedArcade.average_rating || 0)}
          </div>

          <Link to={`/arcades/${selectedArcade.id}`} className="more-info">More Info</Link>
        </div>
      ) : (
        <p>Please select an arcade from the list.</p>
      )}
    </div>
  );
};

export default HomePage;
