const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin');

const isAuthAdmin = require('../middleware/is-AuthAdmin');

router.put('/signup', adminController.signup);

router.post('/login', adminController.login);

router.get('/', adminController.getProducts);

router.get('/product-detail/:productId', adminController.getProductDetail);

router.post('/create-product', isAuthAdmin, adminController.createProduct);

router.post('/edit-product/:productId', isAuthAdmin, adminController.editProduct);

router.delete('/delete-product/:productId', isAuthAdmin, adminController.deleteProduct);

module.exports = router;