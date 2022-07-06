const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin');

const isAuthAdmin = require('../middleware/is-AuthAdmin');

router.put('/signup', adminController.signup);

router.post('/login', adminController.login);

router.post('/product', isAuthAdmin, adminController.createProduct);

module.exports = router;