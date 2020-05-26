const express = require("express");
const router = express.Router();
const adminController = require('../controllers/adminCtrl');

const isAuth = require('../middleware/is-auth');
const validators = require('../middleware/validators');


router.get("/add-product", isAuth, adminController.getAddProduct);

router.post("/add-product", isAuth, validators.postAddProductValidator, adminController.postAddProduct);

router.get('/products', isAuth, adminController.getAdminProducts);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, validators.postEditProductValidator, adminController.postEditProduct);

router.delete('/delete-product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
