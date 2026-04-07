import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/RightSidebar.css';

const RightSidebar = ({
  user,
  setUser,
  isMobile,
  isMobileOpen,
  onRequestClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');  // Error handling
  const navigate = useNavigate(); 
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  useEffect(() => {
    if (isMobileOpen) {
      setIsExpanded(false);
    }
  }, [isMobileOpen]);

  useEffect(() => {
    if (isMobile) {
      onRequestClose();
    }
  }, [location.pathname, isMobile, onRequestClose]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      alert('Registration successful! Please log in.');
      setIsRegistering(false);
      setError('');  // Clear error
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      alert(`Welcome, ${user.username}!`);
      setError('');
      if (isMobile) {
        onRequestClose();
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (location.pathname === '/profile') {
      navigate('/');
    } else {
      setUser(null);
    }
    if (isMobile) {
      onRequestClose();
    }
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <div
      className={`right-sidebar ${isExpanded || isInputFocused ? 'expanded' : ''}${isMobile ? ' mobile-sidebar' : ''}${isMobileOpen ? ' mobile-open' : ''}`}
      onMouseEnter={() => {
        if (!isMobile) {
          setIsExpanded(true);
        }
      }}
      onMouseLeave={() => {
        if (!isMobile && !isInputFocused) {
          setIsExpanded(false);
        }
      }}
    >
      <div className="auth-buttons">
        {user ? (
          <>
            <Typography variant="h6" component="div" gutterBottom className="welcome-text">
              Welcome, {user.username}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/profile"
              fullWidth
              onClick={() => {
                if (isMobile) {
                  onRequestClose();
                }
              }}
            >
              <span>Profile</span>
            </Button>
            <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth style={{ marginTop: '10px' }}>
              <span>Log Out</span>
            </Button>
          </>
        ) : (
          <>
            {isRegistering ? (
              <>
                <TextField
                  name="username"
                  placeholder="Username"
                  inputProps={{ 'aria-label': 'Username' }}
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="email"
                  placeholder="Email"
                  inputProps={{ 'aria-label': 'Email' }}
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="password"
                  type="password"
                  placeholder="Password"
                  inputProps={{ 'aria-label': 'Password' }}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  inputProps={{ 'aria-label': 'Confirm Password' }}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button variant="contained" color="primary" onClick={handleRegister} fullWidth>
                  <span>Register</span>
                </Button>
                <Button variant="text" onClick={() => setIsRegistering(false)} fullWidth>
                  <span>Already have an account? Log in</span>
                </Button>
              </>
            ) : (
              <>
                <TextField
                  name="email"
                  placeholder="Email"
                  inputProps={{ 'aria-label': 'Email' }}
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  name="password"
                  type="password"
                  placeholder="Password"
                  inputProps={{ 'aria-label': 'Password' }}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  fullWidth
                  margin="normal"
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                  <span>Log In</span>
                </Button>
                <Button variant="text" onClick={() => setIsRegistering(true)} fullWidth>
                  <span>Don't have an account? Register</span>
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
