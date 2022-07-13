const fs = require('fs');

const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Product = require('../models/product');
const Category = require('../models/category');
const mongodb = require('mongodb');
const ObjectId = mongodb.ObjectId;

const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = true;

    var salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    try {
        const user = new User(username, email, hashPassword, isAdmin);
        const savedUser = await user.save();
        //const savedResult = {...}
        res.json({message: 'Signed up!', user: savedUser});
    } catch(error) {
        next(error);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try{
        const savedUser = await User.findUser(email);
        if (!savedUser) {
            return res.send('User not found, sign up!');
        }
        //console.log(savedUser);
        bcrypt.compare(password, savedUser.password, function(err, res) {
            //console.log(res);
            if (!res) {
                const error = new Error('Wrong password!')
                error.statusCode = 401;
                throw error;
            }
        })

        const token = jwt.sign({
            email: savedUser.email,
            userId: savedUser._id,
        },
        'adminsecretprivatekey',
        {expiresIn: '1h'}
        )
        
        res.json({message: 'Logged in!', token: token, user: savedUser._id});
        
    } catch(error) {
        next(error);
    }
}

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

exports.createProduct = async (req, res, next) => {
    const image = req.file;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const quantity = req.body.quantity;
    const bodyCategory = req.body.category;
    const userId = ObjectId(req.userId); 

    console.log(image);

    const imagePath = image.path;

    let savedCategoryId;

    try {  
        const getCategory = await Category.findCategoryId(bodyCategory);
        console.log(getCategory);
        const categoryId = getCategory._id;
        //console.log(categoryId);
        savedCategoryId = categoryId;   
    } catch(error) {
        console.log(error);
    }
    
    const product = new Product(imagePath, title, price, description, quantity, savedCategoryId, null, userId);
    try {
        const savedProduct = await product.save();
        res.json({message: 'Product created', savedCategory: savedProduct, category: `Saved in ${bodyCategory} category`});
    } catch (error) {
        next(error);
    }
}

exports.editProduct = async (req, res, net) => {
    const prodId = req.params.productId;

    const updatedImage = req.file;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedQuantity = req.body.quantity;
    const updatedBodyCategory = req.body.category;
    const userId = ObjectId(req.userId);

    let savedCategoryId;

    try {
        const category = new Category(null, updatedBodyCategory);
        
        const getCategory = await Category.findCategoryId(updatedBodyCategory);
        //console.log(getCategory);

        if (!getCategory) {
            await category.save();
            const getCategory = await Category.findCategoryId(updatedBodyCategory);
            const categoryId = getCategory._id;
            savedCategoryId = categoryId;
        } else {
            const categoryId = getCategory._id;
            //console.log(categoryId);
            savedCategoryId = categoryId;
        }

    } catch(error) {
        console.log(error);
    }

    const updatedImagePath = updatedImage.path;

    try {
        const savedProduct = await Product.findById(prodId);
        //console.log(savedProduct);
        savedProduct.image = updatedImagePath;
        savedProduct.price = updatedPrice;
        savedProduct.title = updatedTitle;
        savedProduct.description = updatedDescription;
        savedProduct.quantity = updatedQuantity;
        savedProduct.categoryId = savedCategoryId;
         
        const product = new Product(updatedImagePath, updatedTitle, updatedPrice, updatedDescription, updatedQuantity, savedCategoryId, null, userId);
        const editedSavedProduct = await product.edit(prodId);
        //console.log(editedSavedProduct);

        res.send({message: 'Product edited!', product: editedSavedProduct});
    } catch(error) {
        console.log(error);
    }
}

exports.deleteProduct = async (req, res, next) => {
    const prodId = req.params.productId;

    try {
        const savedProduct = await Product.findById(prodId);

        //console.log(savedProduct);

        const imagePath = savedProduct.image;

        fs.unlink(imagePath, (error) => {
            if (error) {
                throw error;
            } else {
                console.log('Image file deleted!');
            }
        })

        await Product.delete(prodId);

        res.send({message: 'Product deleted!'});
    } catch(error) {
        next(error);
    }
}