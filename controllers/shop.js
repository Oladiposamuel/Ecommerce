const mongodb = require('mongodb');
const Product = require('../models/product');
const User = require('../models/user');
const Category = require('../models/category');
const Cart = require('../models/cart');

const{ getDb } = require('../util/database');

const ObjectId = mongodb.ObjectId;

exports.getProducts = async (req, res, next) => {
    const allProducts = await Product.getAllProducts();

    res.send({message: 'All Products!', products: allProducts});
}

exports.getProductDetail = async (req, res, next) => {
    const prodId = req.params.productId;
    const id = ObjectId(prodId);

    try { 
        const productDetail = await Product.findById(id);

        res.send({message: 'Product Detail!', productDetail: productDetail});
    } catch(error) {
        next(error);
    }
}

exports.addToCart = async (req, res, next) => {
    const prodId = req.params.productId;
    const _id = new ObjectId(prodId);
    const userId = ObjectId(req.userId);


    try {
        const cart = new Cart(null, userId);

        const cartDetails = await Cart.findCart(userId);
        //console.log(cartDetails);
        
        if (cartDetails === null) {
            try {
                const savedCart = await cart.save();
                //console.log(savedCart);
                const savedCartDetails = await Cart.findCart(userId);
                //console.log(savedCartDetails);
                const cartId = savedCartDetails._id;
                await Cart.addProduct(_id, cartId, savedCartDetails);
            } catch(error) {
                console.log(error);
            }
        } else {
            const cartId = cartDetails._id;
            await Cart.addProduct(_id, cartId, cartDetails);
        }
        
        res.json({messsage: 'Added to cart'});
    } catch(error) {
        next(error);
    }
}

exports.increaseCartItem = async (req, res, next) => {
    const prodId = req.params.productId;
    const userId = ObjectId(req.userId);

    let newProductQty

    try{
        const prodDetails = await Cart.findProduct(prodId);
        //console.log(prodDetails);
        //console.log(prodDetails.products[0].qty);
        newProductQty = prodDetails.products[0].qty + 1;
        //console.log(newProductQty);
        await Cart.updateProduct(newProductQty, prodId);
    } catch(error) {
        console.log(error);
    }
    
    res.send({message: 'response!'});
}

exports.decreaseCartItem = async (req, res, next) => {
    const prodId = req.params.productId;
    const userId = ObjectId(req.userId);

    let newProductQty

    try{
        const prodDetails = await Cart.findProduct(prodId);
        //console.log(prodDetails);
        //console.log(prodDetails.products[0].qty);
        newProductQty = prodDetails.products[0].qty - 1;
        //console.log(newProductQty);
        await Cart.updateProduct(newProductQty, prodId);
    } catch(error) {
        console.log(error);
    }
    
    res.send({message: 'response!'});
}

exports.deleteCartItem = async (req, res, next) => {
    const prodId = req.params.productId;

    try{
        await Cart.deleteItem(prodId);
    } catch(error) {
        console.log(error);
    }

    res.send({message: 'Item deleted!'});
}

