const LogOutLink = (req, res) => {
  // Add your CSRF token validation logic here
  const clientCSRFToken = req.headers["x-csrf-token"]; // Get CSRF token from request header
  const serverCSRFToken = req.session.csrfToken; // Get CSRF token stored in the session

  // Check if the CSRF tokens match
  if (clientCSRFToken !== serverCSRFToken) {
    return res.sendStatus(403); // Return a forbidden status if CSRF tokens don't match
  }

  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500); // Return a server error status if session destruction fails
    }
    return res.json({ csrfToken: serverCSRFToken }); // Return a success status if logout is successful
  });
};

module.exports = LogOutLink;
