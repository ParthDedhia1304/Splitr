// This middleware checks for a user ID in the headers
// It simulates a "logged in" state without JWT complexity
const auth = (req, res, next) => {
  const userId = req.header('x-user-id'); // We will send this from Frontend

  if (!userId) {
    return res.status(401).json({ msg: 'No user ID, authorization denied' });
  }

  try {
    req.user = userId; // Attach the ID to the request object
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;