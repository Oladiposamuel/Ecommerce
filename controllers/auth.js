//const { json } = require('body-parser');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const isAdmin = false;

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
        console.log(savedUser);
        bcrypt.compare(password, savedUser.password, function(err, res) {
            console.log(res);
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