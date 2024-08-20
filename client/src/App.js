import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ArcadePage from './pages/ArcadePage';
import LoadingScreen from './components/LoadingScreen';
import './styles/globals.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Replace with actual user state management
  const [selectedArcade, setSelectedArcade] = useState(null); // State to hold the selected arcade

  const arcades = [
    // Your list of arcade objects here
    // Example: { id: 1, name: "Arcade Name", address: "123 Main St", rating: 4.5 }
  ];

  useEffect(() => {
    // Simulate an initial data fetch
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulated 2-second loading time
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <TitleBar />
      <LeftSidebar arcades={arcades} onSelectArcade={setSelectedArcade} />
      <RightSidebar user={user} onLogout={() => setUser(null)} />
      <Routes>
        <Route path="/" element={<HomePage selectedArcade={selectedArcade} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/arcade/:id" element={<ArcadePage />} />
      </Routes>
    </Router>
  );
}

export default App;
