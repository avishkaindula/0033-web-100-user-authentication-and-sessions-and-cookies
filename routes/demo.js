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
  // .email is a name of an input bar we created on the signup.ejs template.
  const enteredConfirmEmail = userData["confirm-email"];
  // Since there's a - between confirm and email, we should write it like this.
  // (characters like - are prohibited in dot notation.)
  // We can also write userData.email like => userData["email"] to!
  // 12 will define how strong is the encryption is.
  const enteredPassword = userData.password;

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

  console.log("User is authenticated!");
  res.redirect("/admin");
});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.post("/logout", function (req, res) {});

module.exports = router;
