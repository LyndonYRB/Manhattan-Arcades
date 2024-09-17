// Import dependencies
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const authenticateToken = require('./authMiddleware');

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON data

// Configure the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});


// User Registration Route
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// User Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Both email and password are required' });
  }

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// CREATE: Add a new arcade
app.post('/api/arcades', async (req, res) => {
  const { name, address, days_open, hours_of_operation, serves_alcohol } = req.body;
  
  try {
    const newArcade = await pool.query(
      'INSERT INTO arcades (name, address, days_open, hours_of_operation, serves_alcohol) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, days_open, hours_of_operation, serves_alcohol]
    );
    res.json(newArcade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// READ: Get all arcades
app.get('/api/arcades', async (req, res) => {
  try {
    const allArcades = await pool.query(`
      SELECT arcades.*, 
      (SELECT COALESCE(ROUND(AVG(comments.rating), 1), 0) 
       FROM comments 
       WHERE comments.arcade_id = arcades.id) as average_rating
      FROM arcades
    `);
    res.json(allArcades.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// READ: Get a single arcade by ID
app.get('/api/arcades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const arcade = await pool.query('SELECT * FROM arcades WHERE id = $1', [id]);

    if (arcade.rows.length === 0) {
      return res.status(404).send('Arcade not found');
    }

    res.json(arcade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE: Update an arcade
app.put('/api/arcades/:id', async (req, res) => {
  const { id } = req.params;
  const { name, address, days_open, hours_of_operation, serves_alcohol } = req.body;

  try {
    const updatedArcade = await pool.query(
      'UPDATE arcades SET name = $1, address = $2, days_open = $3, hours_of_operation = $4, serves_alcohol = $5 WHERE id = $6 RETURNING *',
      [name, address, days_open, hours_of_operation, serves_alcohol, id]
    );

    if (updatedArcade.rows.length === 0) {
      return res.status(404).send('Arcade not found');
    }

    res.json(updatedArcade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE: Delete an arcade
app.delete('/api/arcades/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedArcade = await pool.query('DELETE FROM arcades WHERE id = $1 RETURNING *', [id]);

    if (deletedArcade.rows.length === 0) {
      return res.status(404).send('Arcade not found');
    }

    res.json({ message: 'Arcade deleted successfully', arcade: deletedArcade.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Add a comment to an arcade
app.post('/api/arcades/:id/comments', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { comment, rating } = req.body;

  try {
    const existingReview = await pool.query(
      'SELECT * FROM comments WHERE user_id = $1 AND arcade_id = $2',
      [req.user.userId, id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already submitted a review for this arcade.' });
    }

    const newComment = await pool.query(
      `INSERT INTO comments (user_id, arcade_id, comment, rating) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, comment, rating, created_at, 
       (SELECT username FROM users WHERE id = $1) as username`,
      [req.user.userId, id, comment, rating]
    );

    res.json(newComment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get comments for a specific arcade
app.get('/api/arcades/:id/comments', async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await pool.query(
      'SELECT id, comment, rating, created_at, (SELECT username FROM users WHERE id = comments.user_id) as username FROM comments WHERE arcade_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;  // Ensure the userId is extracted from the token

    const deletedComment = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );

    if (deletedComment.rows.length === 0) {
      return res.status(404).send('Comment not found or not authorized');
    }

    res.json({ message: 'Comment deleted successfully', comment: deletedComment.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Serve static files from React frontend
const path = require('path');
app.use(express.static(path.join(__dirname, 'client/build')));

// Serve the React app for any unknown routes (must be placed below API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});
