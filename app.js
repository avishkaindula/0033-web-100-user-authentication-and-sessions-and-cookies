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

    // cookie: {
    //   maxAge: 30 * 24 * 60 * 60 * 1000
    // }
    // This is how we set an expiring time to an cookie.
    // That expiring time is set on milliseconds => 1000 milliseconds = 1 minute
    // If there's no expiring date is set, the cookie won't expire by default.
    // But most browsers actually clear the cookie if the browser shuts down.
    // But if we set maxAge on this session middleware, the browser will not delete the session cookies
    // until that time is met.
  })
);
// This will generate a middleware function which is registered to the overall request funnel.
// session in the const we created when importing express-session package.
// We need to configure this middleware by adding a JS object inside that session and manipulating it's properties.

app.use(async function (req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
    // next tells to move on to the next middleware or the route on the line.
    // The next middleware on the line is app.use(demoRoutes); which is down below.
  }
  // This if condition will get executed if we have no users stored inside sessions.

  const userDoc = await db
    .getDb()
    .collection("users")
    .findOne({ _id: user.id });
  const isAdmin = userDoc.isAdmin;

  res.locals.isAuth = isAuth;
  res.locals.isAdmin = isAdmin;
  // We can use a special express feature to store the information we gathered here in a
  // certain place which we can access from all our templates and routes without explicitly passing
  // the data to them, and in all other parts and all other middle-wares that comes after
  // this middleware. and that's the res.locals filed. Locals allows us to set some global
  // values that will be available throughout this entire request response cycle.
  // A new request will not have any of that previous request's data and a fresh new cycle
  // will be executed for that new request.
  // We can name the keys whatever we want. I've chose => .isAuth and .isAdmin as the keys.
  // now .isAuth and isAdmin are global variables. We can use those variables in all our
  // templates now. We don't need to pass this information into those templates explicitly.

  next();
});
// This is how we create custom middle-wares.
// We need custom middle-wares when we want to forward data that should be available for all
// ejs templates and routes. It's because adding session data and other data manually to all 
// templates and routes is annoying.
// We need to add those middleware "after" the session-package initialization.
// Now that we've created this middle-ware, we can use this data inside the header.ejs file.

// We can use res.locals for anything we want and we can create custom middle-wares for anything we want.

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
