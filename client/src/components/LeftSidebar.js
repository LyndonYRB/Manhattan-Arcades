import React, { useState } from 'react';
import '../styles/LeftSidebar.css';

const LeftSidebar = ({
  arcades = [],
  onSelectArcade,
  selectedArcadeId,
  isMobile,
  isMobileOpen,
  onRequestClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
