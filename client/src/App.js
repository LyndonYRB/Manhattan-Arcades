import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ArcadePage from './pages/ArcadePage';
import './App.css';
import './styles/globals.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedArcade, setSelectedArcade] = useState(null); // State to hold the selected arcade
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 600);
  const [activeMobilePanel, setActiveMobilePanel] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 600;
      setIsMobile(mobile);
      if (!mobile) {
        setActiveMobilePanel(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = activeMobilePanel ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeMobilePanel, isMobile]);

  const handleSelectArcade = (arcade) => {
    setSelectedArcade(arcade); // Update the selected arcade state
    if (isMobile) {
      setActiveMobilePanel(null);
    }
  };

  const openLeftPanel = useCallback(() => {
    setActiveMobilePanel('left');
  }, []);

  const openRightPanel = useCallback(() => {
    setActiveMobilePanel('right');
  }, []);

  const closePanels = useCallback(() => {
    setActiveMobilePanel(null);
  }, []);

  return (
    <Router>
      <div className={`app-shell${activeMobilePanel ? ' mobile-panel-open' : ''}`}>
        <TitleBar
          isMobile={isMobile}
          activeMobilePanel={activeMobilePanel}
          onOpenLeftPanel={openLeftPanel}
          onOpenRightPanel={openRightPanel}
          onClosePanels={closePanels}
        />
        <LeftSidebar
          onSelectArcade={handleSelectArcade}
          selectedArcadeId={selectedArcade?.id}
          isMobile={isMobile}
          isMobileOpen={activeMobilePanel === 'left'}
          onRequestClose={closePanels}
        /> {/* Pass the function as a prop */}
        <RightSidebar
          user={user}
          setUser={setUser}
          isMobile={isMobile}
          isMobileOpen={activeMobilePanel === 'right'}
          onRequestClose={closePanels}
        />
        {isMobile && activeMobilePanel ? (
          <button
            type="button"
            className="mobile-panel-backdrop"
            aria-label="Close open panel"
            onClick={closePanels}
          />
        ) : null}
        <Routes>
          <Route path="/" element={<HomePage selectedArcade={selectedArcade} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          {/* Pass user and setUser to ArcadePage for reactivity */}
          <Route path="/arcades/:id" element={<ArcadePage user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
