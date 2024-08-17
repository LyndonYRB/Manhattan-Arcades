import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Profile from './components/Profile';
import Navbar from './components/Navbar'; // Optional: if you have a Navbar component

function App() {
  return (
   <Router>
      <Navbar />
      <Routes>
        <Route path="/profile" element={<Profile />} />
        {/* Other routes */}
      </Routes>
    </Router>
    
  );
}

export default App;
