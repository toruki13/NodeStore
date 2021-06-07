const crypto = require('crypto');
const brcypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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',
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  console.log(message);
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { password, email } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const { value, msg, param } = errors.array()[0];
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Login',
      errorMessage: msg,
      oldInput: { email },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash('error', 'invalid email or password');
        return res.status(422).render('auth/login', {
          path: '/login',
          docTitle: 'Login',
          errorMessage: 'invalid email or password',
          oldInput: { email },
          validationErrors: errors.array(),
        });
      }
      brcypt
        .compare(password, user.password)
        .then((doMatch) => {
          console.log(doMatch);
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            });
          } else {
            console.log('got an error');
            return res.status(422).render('auth/login', {
              path: '/login',
              docTitle: 'Login',
              errorMessage: 'Wrong Password',
              oldInput: { email },
              validationErrors: errors.array(),
            });
          }
        })
        .catch((err) => {
          console.log('got an error');
          res.redirect('/login');
        });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    errorMessage: message,
    oldInput: { userName: '', email: '' },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, userName, confirmPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const { value, msg, param } = errors.array()[0];

    let errorMessage =
      msg !== 'Invalid value'
        ? msg
        : value.trim() === ''
        ? 'Please enter an email'
        : `${value} is not a valid email, try again`;

    console.log(errors);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage,
      oldInput: {
        userName: param === 'userName' ? '' : userName,
        email: param === 'email' ? '' : email,
      } /* check on this rebbuild */,
      validationErrors: errors.array(),
    });
  }

  brcypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        userName: userName,
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect('/login');

      return transporter.sendMail({
        to: email,
        from: 'rogerpineda1314@gmail.com',
        subject: 'successful signup',
        html: '<h1>You succesfully got in</h1>',
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'reset',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No Account with that email found');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect('/reset');
        transporter.sendMail({
          to: req.body.email,
          from: 'rogerpineda1314@gmail.com',
          subject: 'successful signup',
          html: `<p> you request a password reset<p> 
                 <p> Click this <a href="http://localhost:6050/reset/${token}"> LINL </a>   to set a new password`,
        });
      })
      .catch((error) => {});
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log(user);
      let message = req.flash('error');

      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return brcypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then((result) => {
          res.redirect('/');
        })
        .catch((err) => console.log(err));
    })
    .catch((error) => console.log(error));
};
