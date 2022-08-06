const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const isAuthUser = require('../middleware/is-AuthUser');

router.get('/', shopController.getProducts);

router.get('/product/product-detail/:productId', shopController.getProductDetail);

router.post('/product/:productId', isAuthUser, shopController.addToCart);

router.post('/product/prodinc/:productId', isAuthUser, shopController.increaseCartItem);

router.post('/product/proddec/:productId', isAuthUser, shopController.decreaseCartItem);

router.delete('/product/:productId', isAuthUser, shopController.deleteCartItem);

router.post('/product/buy/:productId', shopController.buyItem);

router.get('/filterByCategory', shopController.filterByCategory);

module.exports = router; 