const mongodb = require('mongodb');
const {getDb} = require('../util/database');

const ObjectId = mongodb.ObjectId;

class User {
    constructor(username, email, password, isAdmin, wallet) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.wallet = wallet;
        this.isAdmin = isAdmin;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    static findUser(email) {
        const db = getDb();
        return db.collection('users').findOne({email : email})
        .then(user => {
            return user;
        })
        .catch(error => {
            next(error);
        });
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({_id: new ObjectId(userId)})
        .then(user => {
            //console.log(user);
            return user;
        })
        .catch(error => {
            next(error);
        });
    }

    static update(userId, walletAmount) {
        const db = getDb();
        return db.collection('users').updateOne({_id: userId}, {$set: {wallet: walletAmount}})
        .then(result => {
            //console.log(result);
            return result;
        })
        .catch(error => {
            next(error);
        })
    }
}

module.exports = User;