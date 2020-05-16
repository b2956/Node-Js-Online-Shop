const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopCtrl');
const isAuth = require('../middleware/is-auth');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postAddToCart);

router.post('/delete-cart-item', isAuth, shopController.postDeleteCartItem);

// router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/create-order', isAuth, shopController.postCreateOrder);

module.exports = router;