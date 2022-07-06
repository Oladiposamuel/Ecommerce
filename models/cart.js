const mongodb = require('mongodb');
const{ getDb } = require('../util/database');
const User = require('../models/user');
const ObjectId = mongodb.ObjectId;


class Cart {

    constructor(_id, userId) {
        this._id =  _id
        this.userId = userId;
        this.products = []
    }
       
    save() {
        const db = getDb();
        db.collection('cart').createIndex({userId: 1}, {unique: true});
        return db.collection('cart').insertOne(this)
        .then(result => {
            return result;
            //console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
    }

    static findCart(userId) {
        const db = getDb();
        return db.collection('cart').findOne({userId: userId})
        .then(result => {
            //console.log(result);
            return result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    static addProduct(prodId, cartId, cartDetails) {

        const db = getDb();
        const dbOp = db.collection('cart').findOne({products: { $exists: true, $in: [cartDetails.products[cartDetails.products.length - 1]] }});

        dbOp.then(result => {

            console.log(result);
            if(result === null) {
                cartDetails.products.push({_id: prodId, qty: +1 });
                return db.collection('cart').updateOne({_id: cartId}, {$set: cartDetails});
            } else {
                
                return db.collection('cart').findOne({_id: cartId})
                .then(result => {
                    //console.log(result);

                    let oldProdIdString = result.products[result.products.length -1]._id.toString();
                    let prodIdString = prodId.toString();
                
                    if (oldProdIdString !== prodIdString) {
                        result.products.push({_id: prodId, qty: +1 });
                        return db.collection('cart').updateOne({_id: cartId}, {$set: result});
                    }

                        let qtyResult = result.products[result.products.length - 1].qty + 1; 
                        //console.log(qtyResult);
                        return db.collection('cart').updateOne({_id: cartId, "products._id": prodId }, {$set: {"products.$.qty": qtyResult }})
                        .then(result => {
                        //console.log(result);
                        return result;

                    })
                })
                .catch(error => {
                    console.log(error);
                })

            }

        })
    }

    static findProduct(id) {
        const db = getDb();
        const prodId = ObjectId(id);
        //console.log(prodId);
        return db.collection('cart').findOne({"products._id": prodId}, {projection: { products: 1, _id: 0 }})
        .then(result => {
            //console.log('Here');
            //console.log(result);
            return result;
        })
        .catch(error => {
            console.log(error);
        })
    }

    static updateProduct(newProductQty, id) {
        const db = getDb();
        const prodId = ObjectId(id);
        console.log(newProductQty);
        return db.collection('cart').updateOne({"products._id": prodId }, {$set: {"products.$.qty": newProductQty }})
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
    }

    static deleteItem (id) {
        const db = getDb();
        const prodId = ObjectId(id);
        return db.collection('cart').updateMany({}, {$pull: {products: { _id: prodId}}})
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log(error);
        })
    }
        
}

module.exports = Cart;