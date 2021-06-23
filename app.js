//#region MODULE IMPORTS

const path = require('path');

/*NPMs*/
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const csrf = require('csurf');
const flash = require('connect-flash');

/*ROUTES mirels IMPORTS*/
const errorController = require('./controllers/error');
const adminDataRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
require('dotenv').config();
//#endregion

/*APP EXPRESSION AND VIEWS CONFIG*/
const app = express();

/* SESSIONS DB STORE */
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

/* Setting the views engine */
app.set('views', 'views');
app.set('view engine', 'ejs');

/*LOGGER*/
app.use(morgan('tiny'));

app.use(express.json({ limit: '20mb' }));

app.use(express.urlencoded({ extended: false, limit: '20mb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my ass hurts daddy',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);

app.use(flash());
/* Checking if there is a user could be written in a middleware*/
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
});
/* could be written in a middleware */
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminDataRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect('/500');
});

const port = process.env.PORT || 9080;

mongoose
  .connect(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening: http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
