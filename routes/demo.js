const express = require("express");
const bcrypt = require("bcryptjs");

const db = require("../data/database");

const router = express.Router();

router.get("/", function (req, res) {
  res.render("welcome");
});

router.get("/signup", function (req, res) {
  res.render("signup");
});

router.get("/login", function (req, res) {
  res.render("login");
});

router.post("/signup", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  // userData['email']
  // .email is a name of an input bar we created on the signup.ejs template.
  const enteredConfirmEmail = userData["confirm-email"];
  // Since there's a - between confirm and email, we should write it like this.
  // (characters like - are prohibited in dot notation.)
  // We can also write userData.email like => userData["email"] to!
  // 12 will define how strong is the encryption is.
  const enteredPassword = userData.password;

  if (
    !enteredEmail ||
    !enteredConfirmEmail ||
    !enteredPassword ||
    enteredPassword.trim().length < 6 ||
    // This will check whether the password is shorter than 6 characters or not.
    // .trim() will exclude the spaces. So if the user enter 6 spaces, this still won't going to work.
    enteredEmail !== enteredConfirmEmail ||
    !enteredEmail.includes("@")
  ) {
    console.log("Incorrect data");
    return res.redirect("/signup");
  }

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (existingUser) {
    console.log("User exists already");
    return res.redirect("/signup");
  }

  const hashedPassword = await bcrypt.hash(enteredPassword, 12);
  // This will encrypt the Password entered by users so that hackers can't decrypt the
  // passwords even if they breached security and stole them.
  // We use a npm package called bcryptjs for that.
  // But we can still verify the password by using this package in the future.

  const user = {
    email: enteredEmail,
    password: hashedPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  // This is how we store a new user.

  res.redirect("/login");
});

router.post("/login", async function (req, res) {
  const userData = req.body;
  const enteredEmail = userData.email;
  const enteredPassword = userData.password;

  const existingUser = await db
    .getDb()
    .collection("users")
    .findOne({ email: enteredEmail });

  if (!existingUser) {
    console.log("Could not log in!");
    return res.redirect("/login");
  }

  const passwordsAreEqual = await bcrypt.compare(
    enteredPassword,
    existingUser.password
  );
  // This is how we validate the password entered by the user.
  // This will check for whether the hashed password (existingUser.password) matches the enteredPassword by the user.

  if (!passwordsAreEqual) {
    console.log("Could not log in - passwords are not equal!");
    return res.redirect("/login");
  }

  req.session.user = { id: existingUser._id, email: existingUser.email };
  // This is how we add data to our session. (We don't store the password here though.)
  // User is a brand new object created by us. We can assign data to that object like this.
  // This data is used to check whether the user is authenticated for using admin page or not.
  // .session is a property/object provided by the express-session package which manages the sessions for us.
  // This data will be stored in the sessions collection of our MongoDB database.
  // Whenever a response is sent express-session package will store this data automatically and assign a unique
  // id for that session.
  req.session.isAuthenticated = true;
  // This is an extra information that we can add. But this data is not necessarily required. This data is also
  // get stored in the database.
  req.session.save(function () {
    res.redirect("/admin");
  });
  // .session.save will force the data to be saved to the database before redirecting the user to the admin page.
  // If we did't add the admin redirection inside this function, that redirection might occur before actually
  // storing the data to the database as saving data to the database is an async task. This might lead to some problems.
  // Therefor, we need to add this admin redirection inside the session.save as this will occur only after the data
  // is saved to the database.

  // Now we need to check this session in the routes that should be protected [router.get("/admin") route]
  //  to find out whether access should be granted or not.
});

router.get("/admin", function (req, res) {
  // Check the user "ticket".
  res.render("admin");
});

router.post("/logout", function (req, res) {});

module.exports = router;
