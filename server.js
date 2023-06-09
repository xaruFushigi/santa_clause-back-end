// back-end related imports
const express = require("express");
const expressSession = require("express-session");
const app = express();

// environment configuration
const dotenv = require("dotenv");
dotenv.config();

// uuid v4
const { v4: uuidv4 } = require("uuid");

// database
const pg = require("pg");
const knex = require("knex");
const pgSession = require("connect-pg-simple")(expressSession);
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});
//checking connection to the database
const pool = new pg.Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});
pool.connect((err, client, release) => {
  if (err) {
    console.error("error connecting to database:", err);
    return;
  }
  client.query("SELECT NOW()", (err, result) => {
    release(); // release the client back to the pool
    if (err) {
      console.error("error executing query:", err);
      return;
    }
    console.log("database connected:", result.rows[0].now);
  });
});

const sessionStore = new pgSession({
  pool: pool,
  tableName: "session",
  sidFieldName: "sid",
  sessionColumnName: "sess",
  expireColumnname: "expire",
  schemaName: "public",
  prineSessionInterval: false,
  generateSid: undefined,
});

// Connection related imports
const cors = require("cors");

// cookie
const cookieParser = require("cookie-parser");

// csrf
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

// fetching of data related imports
const fetch = require("isomorphic-fetch");

// mailing
const nodemailer = require("nodemailer");
//------------------------------Middleware------------------------------//
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: "session_cookie",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production" ? "true" : "auto",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    },
  })
);
app.use(
  cookieParser(process.env.SESSION_SECRET, {
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  })
);
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    methods: ["GET", "POST"],
  })
);

app.use(csrfProtection);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});
//----------------------------END OF Middleware------------------------------//
const setCSRFToken = (req, res, next) => {
  // Get the CSRF token from the request header
  req.clientCSRFToken = req.headers["x-csrf-token"];

  // Get the CSRF token stored on the server
  req.serverCSRFToken = req.session.csrfToken;
  // Call the next middleware or route handler
  next();
};
//------------------------------ROUTES from controllers folder------------------------------//
const RootLink = require("./controllers/Root/RootLink");
const SignInLink = require("./controllers/SignIn/SignInLink");
const SendGiftLink = require("./controllers/SendGift/SendGiftLink");
//------------------------------END OF ROUTES from controllers folder------------------------//

//--------------Routes--------------//
app.get("/csrf-token", (req, res) => {
  const csrfToken = req.csrfToken(); // Generate the CSRF token
  req.session.csrfToken = csrfToken; // token in the session
  res.json({ csrfToken: csrfToken });
});
app.get("/", (req, res) => {
  RootLink.RootLink(req, res);
});
app.post("/signin", csrfProtection, setCSRFToken, (req, res) => {
  SignInLink(req, res, fetch);
});
app.post("/sendGift", csrfProtection, setCSRFToken, (req, res) => {
  SendGiftLink(req, res, fetch, nodemailer);
});
//--------------END OF Routes--------------//

// Start of Server
app.listen(`${process.env.PORT}`, () => {
  console.log(`app is running in port ${process.env.PORT}`);
});
