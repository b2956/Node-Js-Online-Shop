const getDb = require('../utilities/database').getDb;

const mongodb = require('mongodb/index');

class Product {
    constructor(title, imageUrl, price, description, id, userId) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userId = userId;
        
    }

    save() {
        const db = getDb();

        let dataBaseOperation;
        
        if (this._id) {
            // Update products
            dataBaseOperation = db.collection('products').updateOne({ _id: this._id }, { $set: this }); // set receives an obeject as param and this is already and object

        } else {
            dataBaseOperation = db.collection('products').insertOne(this);            
        }
        
        return dataBaseOperation
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err);
            });
    }

    static fetchAll() {
        const db = getDb();

        return db
            .collection('products')
            .find()
            .toArray()
            .then(products => {
                return products;
        })
        .catch (err => {
            console.log(err);
        });
    }

    static findById(prodId) {
        const db = getDb();

        return db
            .collection('products')
            .find({ _id: new mongodb.ObjectId(prodId) })
            .next()
            .then(product => {
                console.log(product);
                return product;
            })
            .catch();

    }

    static deleteById(prodId) {
        const db = getDb();

        return db.
            collection('products')
            .deleteOne({ _id: new mongodb.ObjectId(prodId) })
            .then(result => {
                console.log('Product deleted');
            })
            .catch(err => {
                console.log(err);
            });

    }
}

module.exports = Product;