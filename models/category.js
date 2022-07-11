const mongodb = require('mongodb');
const {getDb} = require('../util/database');

class Category {

    constructor(_id, name) {
        this._id = _id;
        this.name = name;
    }

    save() {
        const db = getDb();
        let dbOp;

        if (this.name) {
            dbOp = db.collection('category').updateOne({_id: this._id}, {$set: this})
        } else {
            dbOp =  db.collection('category').insertOne(this);
        }
        return dbOp
        .then(result => {
            //console.log(result);
            return result;
        })
        .catch(error => {
            next(error);
        })
    }

    static findCategoryId (name) {
        const db = getDb();
        let getCategory;

        return db.collection('category').findOne({name: { "$regex" : name , "$options" : "i"}})
        .then(result => {
            if (result == null) {
                return db.collection('category').insertOne({name: name})
                .then(result => {
                    return db.collection('category').findOne({name: { "$regex" : name , "$options" : "i"}})
                    .then(result => {
                        getCategory = result;
                        return getCategory;
                    })
                })
            } else {
                getCategory = result;
                return getCategory;
            }
        })
        .catch(error => {
            next(error);
        })
    }
       
}

module.exports = Category;