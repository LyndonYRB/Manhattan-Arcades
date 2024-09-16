import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/RightSidebar.css';

const RightSidebar = ({ user, setUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // New state to track if any input field is focused
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '' // Add confirmPassword to the form data
  });

  // Load user from localStorage if available
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Restore user from localStorage
    }
  }, [setUser]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    // Validate that all fields are filled in
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('All fields are required');
      return;
    }
  
    // Check if the passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      alert('Registration successful! Please log in.');
      setIsRegistering(false); // Switch to login view
    } catch (error) {
      console.error('Error during registration:', error);
  
      // Log the full server response for debugging
      if (error.response) {
        console.error('Server response:', error.response.data);
        alert(`Registration failed: ${error.response.data.msg || 'Please try again.'}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    }
  };
  

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert('Both email and password are required.');
      return; // Stop execution if either field is empty
    }
  
    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token); // Store the JWT token
      localStorage.setItem('user', JSON.stringify(user)); // Store the user in localStorage
      setUser(user); // Update user state to reflect logged-in status
      alert(`Welcome, ${user.username}!`);
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please check your credentials and try again.');
    }
  };
  

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the JWT token from localStorage
    localStorage.removeItem('user'); // Remove the user from localStorage
    setUser(null); // Update the user state to log out
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <div
      className={`right-sidebar ${isExpanded || isInputFocused ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isInputFocused) {
          setIsExpanded(false);
        }
      }}
    >
      <div className="auth-buttons">
        {user ? (
          <>
            <Typography variant="h6" component="div" gutterBottom>
              Welcome, {user.username}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/profile"
              fullWidth
            >
              Profile
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              fullWidth
              style={{ marginTop: '10px' }}  // Add some margin between buttons
            >
              Log Out
            </Button>
          </>
        ) : (
          <>
            {isRegistering ? (
              <>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleRegister} fullWidth>
                  Register
                </Button>
                <Button variant="text" onClick={() => setIsRegistering(false)} fullWidth>
                  Already have an account? Log in
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleFocus}  // Keep sidebar expanded while input is focused
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                  Log In
                </Button>
                <Button variant="text" onClick={() => setIsRegistering(true)} fullWidth>
                  Don't have an account? Register
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
