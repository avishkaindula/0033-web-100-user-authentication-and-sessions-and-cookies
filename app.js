const path = require("path");

const express = require("express");

const session = require("express-session");
// This is the package we use for sessions
// Sessions are generated for each and every user and are generated for every incoming request.
// This package will automatically manage the authentication cookies, so we don't need to use 
// a third party cookie library like cookie-parser. We use third party cookie libraries when
// we want to use cookies for other use cases.

const mongodbStore = require("connect-mongodb-session");
// This package is used to store session data in the mongodb database.

const db = require("./data/database");
const demoRoutes = require("./routes/demo");

const MongoDBStore = mongodbStore(session);
// This const MongoDBStore is actually a class (a constructor function) that we can execute 
// to create a new object based on this class blueprint.

const app = express();

const sessionStore = new MongoDBStore({
  uri: "mongodb+srv://avishka_indula:p7iGGaREtxbhN3t3@cluster0.ibnu8y4.mongodb.net/test",
  databaseName: "auth-demo",
  collection: "sessions",
  // "sessions" is not a existing collection in the database. But that collection is created right now.
  // We need to add a object and it's properties like this to configure this sessionStore
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// -------------------------------------------------------------------------------------------------
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "super-secret",
    // This is a string that's used for securing this session. This string is totally up to us to name.
    // This is crucial to ensure that the session can't be faked somehow.
    resave: false,
    // This ensures that the session is only updated in the database if the data in it really changed.
    saveUninitialized: false,
    // This ensures that the session is only stored in the database only if some data is actually in it.
    store: sessionStore,
    // This controls where the session data is actually stored.
    // We can store session data in memory. But if we restart our server the data will be lost.
    // We can use a file storage for this to.
    // But it's better to use a database like MongoDB for this.
    // sessionStore the const we created above.
  })
);
// This will generate a middleware function which is registered to the overall request funnel.
// session in the const we created when importing express-session package.
// We need to configure this middleware by adding a JS object inside that session and manipulating it's properties. 

app.use(demoRoutes);

app.use(function (error, req, res, next) {
  res.render("500");
});
// -------------------------------------------------------------------------------------------------
// This is the overall request funnel.
// So a certain request will go through this funnel before it get executed.

db.connectToDatabase().then(function () {
  app.listen(3000);
});
