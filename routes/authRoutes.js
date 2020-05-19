const express = require('express');

const router = express.Router();

const authController = require('../controllers/authCtrl');

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignUp);

router.post('/signup', authController.postSignUp);

router.get('/reset-password', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/set-new-password/:token', authController.getSetNewPassword);

router.post('/set-new-password/:token', authController.postSetNewPassword);

module.exports = router;