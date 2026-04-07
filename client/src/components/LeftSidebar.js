import React, { useState, useEffect } from 'react';
import '../styles/LeftSidebar.css';

const LeftSidebar = ({
  onSelectArcade,
  selectedArcadeId,
  isMobile,
  isMobileOpen,
  onRequestClose,
}) => {
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
  console.log('API URL:', process.env.REACT_APP_API_URL);
  return (
    <div
      className={`left-sidebar ${isExpanded ? 'expanded' : ''}${isMobile ? ' mobile-sidebar' : ''}${isMobileOpen ? ' mobile-open' : ''}`}
      onMouseEnter={() => {
        if (!isMobile) {
          setIsExpanded(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile) {
          setIsExpanded(false);
        }
      }}
    >
      <ul>
        {arcades.map((arcade) => (
          <li
            key={arcade.id}
            className={selectedArcadeId === arcade.id ? 'selected' : ''}
            onClick={() => {
              onSelectArcade(arcade);
              if (isMobile) {
                onRequestClose();
              }
            }}
            aria-current={selectedArcadeId === arcade.id ? 'true' : undefined}
          >
            {arcade.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeftSidebar;
