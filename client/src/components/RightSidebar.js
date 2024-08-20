import React, { useState } from 'react';
import '../styles/RightSidebar.css';

const RightSidebar = ({ user, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`right-sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="auth-buttons">
        {user ? (
          <>
            <span>{user.username}</span>
            <button onClick={onLogout}>Log Out</button>
          </>
        ) : (
          <>
            <button>Register</button>
            <button>Log In</button>
          </>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
