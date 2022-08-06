const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');

const isAuthUser = require('../middleware/is-AuthUser');

router.put('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/verify/:token', authController.verify);

router.post('/fund-wallet', isAuthUser, authController.fundWallet);

router.get('/get-wallet', isAuthUser, authController.getWallet);

module.exports = router;