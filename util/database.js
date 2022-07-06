const MongoClient = require('mongodb').MongoClient;
const { UUID } = require('bson');

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://Oladipo:0GHuS9lB5EntOd0l@ecommerce.ozfi6.mongodb.net/ecommerce?retryWrites=true&w=majority')
    .then(client => {
        console.log('Connected to Mongodb');
        _db = client.db();
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    })
}

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;