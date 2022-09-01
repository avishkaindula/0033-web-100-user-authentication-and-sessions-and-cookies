const express = require("express");

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
  const enteredPassword = userData.password;

  const user = {
    email: enteredEmail,
    password: enteredPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  // This is how we store a new user.

  res.redirect("/login");
});

router.post("/login", async function (req, res) {});

router.get("/admin", function (req, res) {
  res.render("admin");
});

router.post("/logout", function (req, res) {});

module.exports = router;
