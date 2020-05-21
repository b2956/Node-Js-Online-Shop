const express = require('express');

const router = express.Router();

const authController = require('../controllers/authCtrl');
const  validators = require('../middleware/validators');

router.get('/login', authController.getLogin);

router.post('/login', validators.postLoginValidator ,authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post('/signup', validators.postSignUpValidator ,
authController.postSignUp);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/set-new-password/:token', authController.getSetNewPassword);

router.post('/set-new-password/:token', authController.postSetNewPassword);

module.exports = router;