const express = require("express");
const User = require("../models/User");
const bookStore = require("../models/bookSchema")
const passport = require("passport");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const wrapAsync = require("../utils/wrapasync");
const ExpressError = require("../utils/ExpressError")
const Comment = require("../models/comment")

const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });

router.get("/home", async (req, res) => {
  let Books = await bookStore.find({});
  res.render("pages/index.ejs", { Books })
});

// * add book
router.get("/add", isLoggedIn, wrapAsync((req, res) => {
  res.render("pages/add.ejs")
}));

router.post("/add", isLoggedIn, upload.single("photo"), wrapAsync(async (req, res) => {
  // Extract data from req.body
  const { author, title, description, pdf, genre } = req.body.Book;

  // Ensure all required fields are present
  if (!author || !title || !description || !pdf || !genre) {
    throw new ExpressError(400, "All fields are required");
  }

  // Ensure a file is uploaded
  if (!req.file) {
    throw new ExpressError(400, "File upload failed");
  }

  // Extract photo URL from req.file
  const photoUrl = req.file.path;

  // Create a new book instance with the extracted data
  const newBook = new bookStore({
    author,
    title,
    description,
    pdf,
    genre,
    photo: photoUrl, // Assign photo URL
    owner: req.user._id,
  });

  // Save the new book to the database
  await newBook.save();

  // Set success flash message and redirect to home page
  req.flash("success", "New Book is Added");
  res.redirect("/home");
}));



//view 
router.get("/view/:id", wrapAsync(async (req, res) => {

  const { id } = req.params;
  const book = await bookStore.findById(id);
  const currentUser = req.user;

  res.render("pages/view.ejs", { book, currentUser });
}));

// * edit - rout
router.get("/edit/:id", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params
  let book = await bookStore.findById(id)
  res.render("pages/edit.ejs", { book })
}))
router.post("/edit/:id", isLoggedIn, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let currBook = await bookStore.findById(id);
  let { title, author, description, photo, pdf } = req.body;

  currBook.title = title;
  currBook.author = author;
  currBook.description = description;
  currBook.photo = photo;
  currBook.pdf = pdf;

  await currBook.save();
  req.flash("success", "Book is edited successfuly")
  res.redirect(`/view/${id}`);
}));

// * search rout
router.get("/search", wrapAsync(async (req, res) => {
  let search_item = req.query.search;
  const searchResults = await bookStore.find({ title: { $regex: new RegExp(search_item, 'i') } });
  res.render("pages/search", { Books: searchResults });
}))

// * trending 
router.get("/trending", wrapAsync(async (req, res) => {
  let Books = await bookStore.find().sort({ date: -1 });
  res.render("pages/trendingbooks.ejs", { Books });
}))
// * catagory
router.get("/category", (req, res) => {
  res.render("pages/catagory.ejs")
})

router.get("/delete/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let book = await bookStore.findById(id);

  if (!book) {
    return res.status(404).send("Book not found");
  }

  await book.deleteOne();
  req.flash("success", "Book is deleted successfully")
  res.redirect("/home");
}))

// * comment routs
router.post("/addComment/:id", isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const currBook = await bookStore.findById(id);
  if (!currBook) {
    return res.status(404).send("Book not found");
  }

  if (!req.user || !req.user._id) {
    req.flash("error", "this functionality is ni progress")
    res.redirect("")
  }

  const newComment = new Comment({
    comment: req.body.comment,
    owner: req.user._id,
  });
  await newComment.save();
  currBook.comments.push(newComment);
  await currBook.save();
  res.send(currBook);
}));


// router.get("/demouser", async (req, res) => {
//   try {
//     let fakeUser = new User({
//       email: "anirbansantra748@gmail.com",
//       username: "anirban",
//     });

//     let newUser = await User.register(fakeUser, "1234");
//     res.send("User registered successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error registering user");
//   }
// });

// * user rout
router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
})

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, ((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'Welcome to wanderlust');
      res.redirect('/home');
    }))
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/signup');
  }
});


router.get("/login", wrapAsync((req, res) => {
  res.render("user/login.ejs")
}))

router.post("/login", passport.authenticate("local", {
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
  // Authentication succeeded, so redirect to the intended page or home
  req.flash('success', 'Welcome back to kitabi Kira!');
  res.redirect('/home');
});



router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return res.next(err);
    }
    req.flash("success", "Logged out succesfully")
    res.redirect("/home")
  })
})

router.get("*", (req, res) => {
  res.render("pages/error.ejs")
})


module.exports = router;
