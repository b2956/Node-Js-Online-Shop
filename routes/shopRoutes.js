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

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', isAuth, shopController.getCheckoutSuccess);

router.get('/checkout/cancel', isAuth, shopController.getCheckout);

// router.post('/create-order', isAuth, shopController.postCreateOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getOrderInvoice);



module.exports = router;