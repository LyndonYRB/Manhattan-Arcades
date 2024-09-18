import React, { useState, useEffect } from 'react';
import '../styles/LeftSidebar.css';

const LeftSidebar = ({ onSelectArcade }) => {
  const [arcades, setArcades] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchArcades = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/arcades`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        setArcades(data);
      } catch (error) {
        console.error('Error fetching arcades:', error);
      }
    };

    fetchArcades();
  }, []);

  return (
    <div
      className={`left-sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <ul>
        {arcades.map((arcade) => (
          <li key={arcade.id} onClick={() => onSelectArcade(arcade)}>
            {arcade.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;
