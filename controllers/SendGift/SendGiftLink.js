const SendGiftLink = async (req, res, fetch, nodemailer) => {
  const clientCSRFToken = req.clientCSRFToken; // Get CSRF token from request header
  const serverCSRFToken = req.serverCSRFToken; // Get CSRF token stored on the server
  const currentDate = new Date();

  // email service configuration
  const transporter = nodemailer.createTransport({
    // Specify your email service configuration (SMTP settings, etc.)
    // Example configuration for Gmail:
    service: process.env.EMAIL_SERVER,
    auth: {
      user: process.env.EMAIL_ADDRESS_SENDER,
      pass: process.env.EMAIL_PASSWORD_SENDER,
    },
  });

  if (clientCSRFToken === serverCSRFToken) {
    try {
      // -- Registered Users Database --//
      const responseRegisteredUser = await fetch(
        "https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json"
      );
      const dataRegisteredUser = await responseRegisteredUser.json();
      if (responseRegisteredUser.ok) {
        const usernameArrayFromDatabase = dataRegisteredUser.map((item) => {
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
        // -- END OF Registered Users Database --//

        // -- Users Information Database --//
        const responseUsersInformation = await fetch(
          "https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json"
        );
        const dataUsersInformation = await responseUsersInformation.json();
        if (responseUsersInformation.ok) {
          const getUserInformation = dataUsersInformation.some((element) => {
            const birthdateComponents = element.birthdate.split("/");
            const year = parseInt(birthdateComponents[0]);
            const day = parseInt(birthdateComponents[1]);
            const month = parseInt(birthdateComponents[2]) - 1;

            const birthdate = new Date(year, month, day);

            return (
              element.userUid === req.body.uid &&
              currentDate.getFullYear() - birthdate.getFullYear() <= 10
            );
          });
          pendingRequests.push({
            method: req.method,
            url: req.url,
          });
          // send mail to santa-clause
          const mailOptions = {
            from: EMAIL_ADDRESS_SENDER, // replace with your email address
            to: EMAIL_ADDRESS_RECEIVER, // replace with Santa Claus's email address
            subject: "Gift Letter",
            text: `Happy Holidays! ${req.body.giftMessage}`,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("Error sending email:", error);
            } else {
              console.log("Email sent:", info.response);
            }
          });

          return res.status(200).json(getUserInformation);
        }
        // -- END OF Users Information Database --//

        // // returns to front-end status 200 and result of comparison
        // return res.status(200).send(isUserRegistered);
      }
    } catch (error) {
      return res.status(500).send({ message: "something went wrong" });
    }
  } else {
    return res.status(500).send({ message: "something went wrong" });
  }
};

module.exports = SendGiftLink;
