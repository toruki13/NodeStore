const router = require('express').Router();
const { check, body } = require('express-validator');
const { reset } = require('nodemon');

/* destructured admin controller methods  */
const {
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
} = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

/* GET PRODUCT LIST */
router.get('/products', isAuth, getProducts);

/* ADD PRODUCT */
router.get('/add-product', isAuth, getAddProduct);
router.post(
  '/add-product',
  [
    body('title', 'Title must be 5 characters minimum')
      .isLength({ min: 5 })
      .trim(),
    /* body('imageUrl', 'Please enter a valid image URL ').isURL().trim(), */
    body('price', 'Price must be a number').isNumeric(),
    body('description', 'description should be 5 letters long')
      .isLength({
        min: 10,
      })
      .custom((value, { req }) => {
        /*  console.log(req.body); */
        const wordsArray = req.body.description.split(' ');
        const amountOfWords = wordsArray.length;
        /*  console.log(amountOfWords); */
        if (!amountOfWords || amountOfWords < 8) {
          throw new Error(`The Description Should be 8 words minimum`);
        }
        return true;
      }),
  ],
  isAuth,
  postAddProduct
);

/* EDIT PRODUCT */

router.get('/edit-product/:productId', isAuth, getEditProduct);
router.post(
  '/edit-product',
  [
    body('title', 'Title must be 5 characters minimum')
      .isLength({ min: 5 })
      .trim(),
    body('price', 'Price must be a number').isNumeric(),
    body('description', 'description should be 5 letters long')
      .isLength({
        min: 10,
      })
      .custom((value, { req }) => {
        /*  console.log(req.body); */
        const wordsArray = req.body.description.split(' ');
        const amountOfWords = wordsArray.length;
        console.log(amountOfWords);
        if (!amountOfWords || amountOfWords < 8) {
          throw new Error(`The Description Should be 8 words minimum`);
        }
        return true;
      }),
  ],
  isAuth,
  postEditProduct
);

/* DELETE PRODUCT */
router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;
