import React from 'react';
import '../styles/LoadingScreen.css'; // Import the CSS for styling

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingScreen;
