const express = require('express');
const bcrypt = require('bcrypt');
const authenticateToken = require('./authMiddleware');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Configure the PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// User registration route
// User registration route
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate that all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user into the database
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// User login route
// User login route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ msg: 'Both email and password are required' });
  }

  try {
    // Check if the user exists
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: user.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// CREATE: Add a new arcade (POST request)
app.post('/api/arcades', async (req, res) => {
  try {
    const { name, address, days_open, hours_of_operation, serves_alcohol } = req.body;
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

// READ: Get all arcades (GET request)
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

// READ: Get a single arcade by ID (GET request)
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

// UPDATE: Update an arcade (PUT request)
app.put('/api/arcades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, days_open, hours_of_operation, serves_alcohol } = req.body;

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

// DELETE: Delete an arcade (DELETE request)
app.delete('/api/arcades/:id', async (req, res) => {
  try {
    const { id } = req.params;

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
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    // Check if the user has already submitted a review for this arcade
    const existingReview = await pool.query(
      'SELECT * FROM comments WHERE user_id = $1 AND arcade_id = $2',
      [req.user.userId, id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ msg: 'You have already submitted a review for this arcade.' });
    }

    // Add the comment/rating to the database and return the username
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

app.get('/api/arcades/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch comments for a specific arcade
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

app.put('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { comment, rating } = req.body;
    console.log('Editing comment:', commentId, comment, rating, req.user.userId);

    // Update the comment in the database
    const updatedComment = await pool.query(
      'UPDATE comments SET comment = $1, rating = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *',
      [comment, rating, commentId, req.user.userId]
    );

    if (updatedComment.rows.length === 0) {
      return res.status(404).send('Comment not found or not authorized');
    }

    res.json(updatedComment.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.delete('/api/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    // Delete the comment from the database
    const deletedComment = await pool.query(
      'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
      [commentId, req.user.userId]
    );

    if (deletedComment.rows.length === 0) {
      return res.status(404).send('Comment not found or not authorized');
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extract user ID from the JWT token

    // Fetch reviews and include the arcade name
    const reviewsResult = await pool.query(
      `SELECT comments.*, arcades.name as arcade_name
       FROM comments
       JOIN arcades ON comments.arcade_id = arcades.id
       WHERE comments.user_id = $1
       ORDER BY comments.created_at DESC`,
      [userId]
    );

    const reviews = reviewsResult.rows;

    res.json({ userId, comments: reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


const getUserReviews = async (userId) => {
  const result = await pool.query(
    `SELECT comments.id, comments.comment, comments.rating, comments.created_at, arcades.name AS arcade_name
     FROM comments
     JOIN arcades ON comments.arcade_id = arcades.id
     WHERE comments.user_id = $1
     ORDER BY comments.created_at DESC`,
    [userId]
  );
  return result.rows; // Make sure 'id' is included in the returned rows
};




// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
