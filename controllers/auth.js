const mongodb = require('mongodb');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const ObjectId = mongodb.ObjectId;

//const mailchimp = require("@mailchimp/mailchimp_marketing");

let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "6c3ee6256b17ec",
      pass: "70bc488aaac9a7"
    }
  });


exports.signup = async (req, res, next) => {

    // mailchimp.setConfig({
    //     apiKey: "d455ce19e2b688ba8b12539bd86d9e95-us17",
    //     server: "us17",
    // });

    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = false;
    const verified = false;

    var salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    try {
        const user = new User(username, email, hashPassword, isAdmin, verified);
        const savedUser = await user.save();
        const savedUserDetails = await User.findUser(email);
        console.log(savedUserDetails);

        const verificationToken = jwt.sign({
            email: savedUserDetails.email,
            userId: savedUserDetails._id,
        },
        'verificationsecretprivatekey',
        {expiresIn: '1h'}
        )

        const url = `http://localhost:8080/verify/${verificationToken}`;

        transport.sendMail({
            to: email,
            subject: 'Verify Account',
            html: `Click <a href = '${url}'>here</a> to confirm your email. Link expires in an hour.`
        })

        res.json({message: `Sent a verification email to ${email}`, user: savedUser});
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

exports.verify = async (req, res, next) => {
    const token = req.params.token;
    //console.log(token);

    if (!token) {
        return res.send({message: "Missing Token"});
    }

    let userData;
    try {
        payload = jwt.verify(token, 'verificationsecretprivatekey',  function (error, decoded) {
            if (error) {
                console.log(error);
            } 
            //console.log(decoded);
            userData = decoded;
        });
        //console.log(userData);
        const user = await User.findUser(userData.email);
        console.log(user);
        const id = user._id;
        if (!user) {
            return res.send({message: "User not found!"});
        }
        user.verified = true;
        
        const updatedUser = await User.update(id);

        res.send({message: "Account verified"});
    } catch (error) {
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