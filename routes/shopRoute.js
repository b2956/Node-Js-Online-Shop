const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shopCtrl');

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

// router.get('/cart', shopController.getCart);

// router.post('/cart', shopController.postAddToCart);

// // router.get('/checkout', shopController.getCheckout);

// router.get('/orders', shopController.getOrders);

// router.post('/delete-cart-item', shopController.postDeleteCartItem);

// router.post('/create-order', shopController.postCreateOrder);

module.exports = router;