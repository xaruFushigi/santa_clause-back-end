const ProtectedLink = (req, res) => {
  const clientCSRFToken = req.clientCSRFToken; // Get CSRF token from request header
  const serverCSRFToken = req.serverCSRFToken; // Get CSRF token stored on the server
  if (req.session.authenticated) {
    res.sendStatus(200);
  } else {
    res.sendStatus(401);
  }
};

module.exports = ProtectedLink;
