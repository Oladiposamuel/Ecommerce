const mongodb = require('mongodb');
const {getDb} = require('../util/database');

const ObjectId = mongodb.ObjectId;

class Product {

    constructor(image, title, price, description, quantity, categoryId, _id, userId) {
        this.image = image;
        this.title = title;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
        this.categoryId = categoryId;
        this._id = _id ? new ObjectId(_id) : null;
        this.userId = userId;
    }


    save() {
        const db = getDb();
        let dbOp;

        if (this._id) {
            dbOp = db.collection('products').updateOne({_id: this._id}, {$set: this})
            //db.collection('products').createIndex({title: 1}, {unique: true});
        } else {
            db.collection('products').createIndex({title: 1}, {unique: true});
            dbOp = db.collection('products').insertOne(this)
        }
        return dbOp
        .then(result => {
            //console.log(result);
        })
        .catch(error => {
            console.log(error);
            if (error.code == 11000) {
                const error = new Error('Product already exists');
                throw error;
            }
            return error;
        })
    }
}

module.exports = Product;