const router = require('express').Router();

/* Destructured Shop Controller methods*/
const {
  getIndex,
  getProducts,
  getProduct,
  postCart,
  getCart,
  postCartDeleteProduct,
  postOrder,
  getOrders,
  getInvoice,
} = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

/* GET PRODUCT LIST */
router.get('/', getIndex);
router.get('/shop', getIndex);
router.get('/products', getProducts);

/* GET PRODUCT LIST */
router.get('/products/:productId', getProduct);
router.post('/cart', isAuth, postCart);
router.get('/cart', isAuth, getCart);
router.post('/cart-delete-item', isAuth, postCartDeleteProduct);
router.post('/create-order', isAuth, postOrder);
router.get('/orders', isAuth, getOrders);

router.get('/orders/:orderId', isAuth, getInvoice);
module.exports = router;
