// Import dependencies
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const authenticateToken = require('./authMiddleware');
const path = require('path');
const helmet = require('helmet');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Enable CORS for all routes
app.use(express.json()); // Parse incoming JSON data

// Configure the PostgreSQL connection pool
const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === 'production'
      ? process.env.DATABASE_URL // Use Heroku's DATABASE_URL in production
      : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // Use local DB settings in development
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});




// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'", 'https:'],
        "script-src": ["'self'", "'unsafe-inline'", 'https:'],
        "style-src": ["'self'", "'unsafe-inline'", 'https:'],
        "img-src": ["'self'", 'data:', 'https:'],
        "connect-src": ["'self'", 'https:', 'http://localhost:5000'], // Allow API calls to localhost in development
        "font-src": ["'self'", 'https:'],
      },
    },
  })
);

// API Routes

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
app.post('/api/arcades', authenticateToken, async (req, res) => {
  const { name, address, days_open, hours_of_operation, serves_alcohol, latitude, longitude } = req.body;

  try {
    const newArcade = await pool.query(
      `INSERT INTO arcades (
        name,
        address,
        days_open,
        hours_of_operation,
        serves_alcohol,
        latitude,
        longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [name, address, days_open, hours_of_operation, serves_alcohol, latitude ?? null, longitude ?? null]
    );
    res.json(newArcade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GIS: Return arcade venues as a GeoJSON FeatureCollection.
app.get('/api/venues/geojson', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(feature), '[]'::json)
      ) AS geojson
      FROM (
        SELECT json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(arcades.location::geometry)::json,
          'properties', json_build_object(
            'id', arcades.id,
            'name', arcades.name,
            'address', arcades.address,
            'rating', COALESCE(ROUND(AVG(comments.rating), 1), 0),
            'serves_food', arcades.serves_food,
            'serves_alcohol', arcades.serves_alcohol
          )
        ) AS feature
        FROM arcades
        LEFT JOIN comments ON arcades.id = comments.arcade_id
        WHERE arcades.location IS NOT NULL
        GROUP BY arcades.id
        ORDER BY arcades.name
      ) features;
    `);

    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error('Error building venue GeoJSON:', err.message);
    res.status(500).json({ msg: 'Unable to build venue GeoJSON' });
  }
});

// GIS: Find venues near a coordinate using PostGIS distance in meters.
app.get('/api/venues/nearby', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius ?? 1000);

  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ msg: 'lat must be a number between -90 and 90' });
  }

  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ msg: 'lng must be a number between -180 and 180' });
  }

  if (!Number.isFinite(radius) || radius <= 0 || radius > 50000) {
    return res.status(400).json({ msg: 'radius must be a positive number up to 50000 meters' });
  }

  try {
    const nearbyArcades = await pool.query(
      `
        WITH search_point AS (
          SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS geog
        )
        SELECT
          arcades.id,
          arcades.name,
          arcades.address,
          arcades.latitude,
          arcades.longitude,
          COALESCE(ROUND(AVG(comments.rating), 1), 0) AS average_rating,
          -- ST_Distance returns meters because both values are geography.
          ROUND(ST_Distance(arcades.location, search_point.geog)::numeric, 2) AS distance_meters
        FROM arcades
        CROSS JOIN search_point
        LEFT JOIN comments ON arcades.id = comments.arcade_id
        WHERE arcades.location IS NOT NULL
          AND ST_DWithin(arcades.location, search_point.geog, $3)
        GROUP BY arcades.id, search_point.geog
        ORDER BY ST_Distance(arcades.location, search_point.geog) ASC;
      `,
      [lng, lat, radius]
    );

    res.json(nearbyArcades.rows);
  } catch (err) {
    console.error('Error fetching nearby venues:', err.message);
    res.status(500).json({ msg: 'Unable to fetch nearby venues' });
  }
});

// READ: Get all arcades with average ratings
app.get('/api/arcades', async (req, res) => {
  try {
    console.log('Fetching arcades...');
    const allArcades = await pool.query(`
      SELECT arcades.*, 
      COALESCE(ROUND(AVG(comments.rating), 1), 0) AS average_rating
      FROM arcades
      LEFT JOIN comments ON arcades.id = comments.arcade_id
      GROUP BY arcades.id
    `);
    console.log('Arcades fetched successfully:', allArcades.rows);
    res.json(allArcades.rows);
  } catch (err) {
    console.error('Error fetching arcades:', err.message);
    res.status(500).send('Server error');
  }
});


// READ: Get a single arcade by ID
app.get('/api/arcades/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const arcade = await pool.query('SELECT * FROM arcades WHERE id = $1', [id]);

    if (arcade.rows.length === 0) {
      return res.status(404).json({ msg: 'Arcade not found' });
    }

    res.json(arcade.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// READ: Get comments for an arcade
app.get('/api/arcades/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const arcadeComments = await pool.query(
      `SELECT comments.*, users.username 
       FROM comments 
       JOIN users ON comments.user_id = users.id 
       WHERE comments.arcade_id = $1`, 
      [id]
    );
    if (arcadeComments.rows.length === 0) {
      return res.status(404).json({ msg: 'No comments found for this arcade' });
    }
    res.json(arcadeComments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});


// CREATE: Add a comment to an arcade
// CREATE: Add a comment to an arcade
app.post('/api/arcades/:id/comments', authenticateToken, async (req, res) => {
  const { id } = req.params; // Arcade ID
  const { comment, rating } = req.body;

  if (!comment || !rating) {
    return res.status(400).json({ msg: 'Both comment and rating are required' });
  }

  try {
    // Check if the user has already submitted a review for this arcade
    const existingReview = await pool.query(
      'SELECT * FROM comments WHERE user_id = $1 AND arcade_id = $2',
      [req.user.userId, id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already submitted a review for this arcade.' });
    }

    // If no existing review, create a new one
    const newComment = await pool.query(
      `INSERT INTO comments (user_id, arcade_id, comment, rating) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, comment, rating, created_at, 
       (SELECT username FROM users WHERE id = $1) as username`,
      [req.user.userId, id, comment, rating]
    );

    res.json(newComment.rows[0]);
  } catch (err) {
    console.error('Error creating comment:', err);
    res.status(500).send('Server error');
  }
});



// READ: Get reviews for the logged-in user
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userReviews = await pool.query(
      `SELECT comments.*, arcades.name as arcade_name
       FROM comments
       JOIN arcades ON comments.arcade_id = arcades.id
       WHERE comments.user_id = $1
       ORDER BY comments.created_at DESC`,
      [userId]
    );
    res.json({ comments: userReviews.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE: Edit a comment (requires authentication)
app.put('/api/comments/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;
  const { comment, rating } = req.body;
  const userId = req.user.userId;

  try {
    const updatedComment = await pool.query(
      'UPDATE comments SET comment = $1, rating = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [comment, rating, commentId, userId]
    );

    if (updatedComment.rows.length === 0) {
      return res.status(404).json({ msg: 'Comment not found or not authorized' });
    }

    res.json(updatedComment.rows[0]);
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).send('Server error');
  }
});

// DELETE: Delete a comment (requires authentication)
app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  try {
    const deletedComment = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, userId]
    );

    if (deletedComment.rows.length === 0) {
      return res.status(404).json({ msg: 'Comment not found or not authorized' });
    }

    res.json({ message: 'Comment deleted successfully', comment: deletedComment.rows[0] });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Server error');
  }
});

// Serve static files from React frontend (after the API routes)
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM arcades;');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database query failed');
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
