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

// MongoDB
//const mongo_url = "mongodb://127.0.0.1:27017/BOOKSTORE";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in moongoose session", err);
});

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then(() => {
    console.log("Mongoose started");
  })
  .catch((err) => {
    console.log(err);
  });

store.on("error", () => {
  console.log("error in moongoose session", err);
});

// Session options
const secOpt = {
  store,
  secret: process.env.SECRET,
  resave: true, saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 3600 * 1000,
    maxAge: 7 * 24 * 3600 * 1000,
    httpOnly: true,
  },
};


// Middleware setup
app.use(session(secOpt));
app.use(flash())
app.use(passport.initialize());
app.use(passport.session());

// Middleware for flash messages
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
});


// Passport LocalStrategy setup
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use("/", router);

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong!' } = err;
  res.status(statusCode).render('pages/error.ejs', { err });
});

app.listen(port, () => {
  console.log("App is started");
});
