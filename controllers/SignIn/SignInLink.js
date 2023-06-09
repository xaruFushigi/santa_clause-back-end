const SignInLink = async (req, res, fetch) => {
  const clientCSRFToken = req.clientCSRFToken; // Get CSRF token from request header
  const serverCSRFToken = req.serverCSRFToken; // Get CSRF token stored on the server
  if (clientCSRFToken === serverCSRFToken) {
    // fetching user name and uid
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json"
      );
      const data = await response.json();
      if (response.ok) {
        const usernameArrayFromDatabase = data.map((item) => {
          return item;
        });
        // checking user input from front-end with database username
        // if usern input matches with database username returns true
        const isUserRegistered = usernameArrayFromDatabase.some((element) => {
          return (
            element.username === req.body.username &&
            element.uid === req.body.uid
          );
        });
        // returns to front-end status 200 and result of comparison
        return res.status(200).send(isUserRegistered);
      } else {
        return res.status(500).send({ message: "something went wrong" });
      }
    } catch (error) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    res.status(403).json({ error: "Invalid CSRF token" });
  }
};

module.exports = SignInLink;
