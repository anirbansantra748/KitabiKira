if (process.env.NODE_ENV != 'production') {
  require('dotenv').config();
}
const express = require("express");
const session = require("express-session");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = require("./models/User");
const router = require("./routes/book");
const path = require("path");
const flash = require('connect-flash');
const app = express();
const port = 3000;
const dbUrl = process.env.ATLASDB_URL;
const MongoStore = require('connect-mongo');

// Set the path for views and static files
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate); // Use ejs-mate as the template engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

// MongoDB Connection
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true, // Add this option to suppress deprecation warning
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Session setup with MongoDB store
const store = new MongoStore({
  mongoUrl: dbUrl,
  secret: process.env.SECRET,
  touchAfter: 24 * 3600, // Set touchAfter interval (optional)
});

store.on("error", (err) => {
  console.log("Error in MongoDB session store:", err);
});

// Session options
const secOpt = {
  store,
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 3600 * 1000, // Set cookie maxAge (optional)
    httpOnly: true,
  },
};

// Middleware setup
app.use(session(secOpt));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Middleware for flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Passport LocalStrategy setup
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes setup
app.use("/", router);

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("pages/error.ejs", { err });
});

// Start the server
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
