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
            console.log(res);
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
        const category = new Category(null, bodyCategory);
        const savedCategory = await category.save();
        const getCategory = await Category.findCategoryId(bodyCategory);
        //console.log(getCategory);
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