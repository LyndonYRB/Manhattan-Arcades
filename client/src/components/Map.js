import React from 'react';
import '../styles/Map.css';

const Map = ({ selectedArcade }) => {
  return (
    <div className="map">
      <img src="/path-to-manhattan-map.svg" alt="Manhattan Map" />
      {selectedArcade && (
        <div className="arcade-highlight">
          <p>{selectedArcade.name}</p>
          {/* Additional code to highlight the dot on the map */}
        </div>
      )}
    </div>
  );
};

export default Map;
