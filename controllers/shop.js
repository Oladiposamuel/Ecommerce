const https = require('https');
const mongodb = require('mongodb');
const axios = require('axios');
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

exports.buyItem = async (req, res, next) => {
    const prodId = ObjectId(req.params.productId);
    const quantity = req.query.quantity;
    const email = req.body.email;
    //const amount = req.body.amount;

    let newProductQty;

    try {
        const savedProduct = await Product.findById(prodId);
        //console.log(savedProduct);
        let productPrice = +savedProduct.price;
        let productQty = +savedProduct.quantity;
        
        let totalAmount = productPrice * quantity * 100;

        if(productQty < quantity) {
            throw new Error('Please reduce number of item!');
        } else {
            newProductQty = productQty - quantity;
            //console.log(newProductQty);
        } 

        const updatedProduct = await Product.update(prodId, newProductQty);

        const params = JSON.stringify({
            "email": email,
            "amount": +totalAmount
        })

        const options = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
              Authorization: 'Bearer sk_test_b579d50e0976f15d6d022c33f3f87573117be2ee',
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
        }


        const req = https.request(options, res => {
        let data = ''
        let resData;
        
        res.on('data', (chunk) => {
            data += chunk
        });
        
        res.on('end', (res) => {
            resData = JSON.parse(data);
            //console.log(resData);
            //url = resData.data.authorization_url;
            processData(resData);
        })


        }).on('error', error => {
        console.error(error)
        })
        
        req.write(params)
        req.end()

        
        const processData = (resData) => {
            res.json({message: 'Message!', data: resData});
        }

    } catch (error) {
        console.log(error);
        next(error);
    }

}

exports.filterByCategory = async (req, res, next) => {
    const categories = req.query.categories.split(",");
    //console.log(categories);


    const products = await Promise.all(categories.map( async (category) => {
        const savedCategory = await Category.findCategoryId(category);
        //console.log(savedCategory);
        const id = savedCategory._id.toString();

        const savedProduct = await Product.findByCategoryId(id);
        return savedProduct;
    }))

    res.send({message: 'filtered!', productsByCategory: products });
}
