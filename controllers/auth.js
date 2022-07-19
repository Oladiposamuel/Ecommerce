const mongodb = require('mongodb');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ObjectId = mongodb.ObjectId;

//const mailchimp = require("@mailchimp/mailchimp_marketing");

exports.signup = async (req, res, next) => {

    // mailchimp.setConfig({
    //     apiKey: "d455ce19e2b688ba8b12539bd86d9e95-us17",
    //     server: "us17",
    // });

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = false;

    var salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    
    //const listId = 'b33c56c530';

    // async function run() {
    //     const response = await mailchimp.lists.addListMember(listId, {
    //       email_address: email,
    //       status: "subscribed",
    //       merge_fields: {
    //         FNAME: username,
    //         //LNAME: username
    //       }
    //     });
      
    //     console.log(
    //       `Successfully added contact as an audience member. The contact's id is ${
    //         response.id
    //       }.`
    //     );
    // }
      
    // run();

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

        if(savedUser.isAdmin == true) {
            const error = new Error('Not authorized!')
            throw error;
        }

        const token = jwt.sign({
            email: savedUser.email,
            userId: savedUser._id,
        },
        'usersecretprivatekey',
        {expiresIn: '1h'}
        )
        
        res.json({message: 'Logged in!', token: token, user: savedUser});
        
    } catch(error) {
        next(error);
    }
}

exports.fundWallet = async (req, res, next) => {
    const userId = ObjectId(req.userId);
    const amount = req.body.amount;

    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found!');
        }
        let walletAmount = user.wallet;
        walletAmount = amount;

        const updatedUser = await User.update(userId, walletAmount);
        //console.log(updatedUser);

        res.send({message: 'User found!'});
    } catch(error) {
        next(error);
    }

}

exports.getWallet = async (req, res, next) => {
    const userId = ObjectId(req.userId);

    try{
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found!');
        }
        let walletAmount = user.wallet;

        res.send({message: "Wallet Amount!", walletAmount: walletAmount});

    } catch (error) {
        next(error);
    }
}