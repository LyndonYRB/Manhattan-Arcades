const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
    const allArcades = await pool.query('SELECT * FROM arcades');
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
