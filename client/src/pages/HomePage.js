import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = ({ selectedArcade }) => {
  return (
    <div className="home-page-content">
      {selectedArcade ? (
        <div className="arcade-info">
          <h2>{selectedArcade.name}</h2>
          <p>{selectedArcade.address}</p>
          <p>Average Rating: {selectedArcade.rating} stars</p>
          <Link to={`/arcades/${selectedArcade.id}`} className="more-info">More Info</Link>
        </div>
      ) : (
        <p>Please select an arcade from the list.</p>
      )}
    </div>
  );
};

export default HomePage;

