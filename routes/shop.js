const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const isAuthUser = require('../middleware/is-AuthUser');

router.get('/', shopController.getProducts);

router.post('/product/:productId', isAuthUser, shopController.addToCart);

router.post('/product/prodinc/:productId', isAuthUser, shopController.increaseCartItem);

router.post('/product/proddec/:productId', isAuthUser, shopController.decreaseCartItem);

router.delete('/product/:productId', isAuthUser, shopController.deleteCartItem);

module.exports = router; 