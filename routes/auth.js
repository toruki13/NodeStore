const router = require('express').Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
/* const router = express.Router(); */

/* destructured auth controller methods  */
const {
  getLogin,
  postLogin,
  postLogout,
  getSignup,
  postSignup,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');

router.get('/login', getLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please Enter a valid email address')
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const userEmail = await User.findOne({ email: value });
        if (!userEmail) {
          return Promise.reject(`${value} email is not registered`);
        }
      }),
    body('password', 'please enter a valid password at least 5 characters')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    /*    .custom(async (value, { req }) => {
        const password = await User.findOne({ password: value });
        if (!password) {
          return Promise.reject(` wrong`);
        }
      }) */
  ],
  postLogin
);

router.post('/logout', postLogout);

router.get('/signup', getSignup);

router.post(
  '/signup',
  [
    body('userName', 'enter a username minimum 5 characters maximun 10')
      .isLength({ min: 5, max: 15 })
      .isAlphanumeric(),
    check('email')
      .isEmail()
      .custom(async (value, { req }) => {
        /*  if (value === 'admin@admin.com') {
          throw new Error('this email is forbidden');
        }
        return true;
     */
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject(`${value} is taken, use another email`);
        }
      })
      .normalizeEmail() /* .withMessage('Please enter a valid email') */,
    body('password', 'please enter a valid password at least 5 characters')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('passwords have to match!');
        }
        return true;
      })
      .trim(),
  ],
  postSignup
);

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getNewPassword);

router.post('/new-password', postNewPassword);

module.exports = router;
