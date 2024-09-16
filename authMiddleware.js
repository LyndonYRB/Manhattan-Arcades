const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Get the token from the request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided'); // Debugging log
    return res.sendStatus(401); // If there's no token, return Unauthorized
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed', err); // Debugging log
      return res.sendStatus(403); // If the token is invalid, return Forbidden
    }

    req.user = user; // Attach the user information to the request object
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = authenticateToken;
