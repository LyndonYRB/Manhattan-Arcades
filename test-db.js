const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgres://postgres:BnliUPy5320bEHl@manhattan-arcades-db.internal:5432'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database. Current time:', res.rows[0]);
  }
  pool.end();
});
