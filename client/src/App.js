import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ArcadePage from './pages/ArcadePage';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedArcade, setSelectedArcade] = useState(null); // State to hold the selected arcade

  const handleSelectArcade = (arcade) => {
    setSelectedArcade(arcade); // Update the selected arcade state
  };

  return (
    <Router>
      <TitleBar />
      <LeftSidebar onSelectArcade={handleSelectArcade} /> {/* Pass the function as a prop */}
      <RightSidebar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<HomePage selectedArcade={selectedArcade} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        {/* Pass user and setUser to ArcadePage for reactivity */}
        <Route path="/arcades/:id" element={<ArcadePage user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;
