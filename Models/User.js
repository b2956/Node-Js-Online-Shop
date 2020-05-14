const getDb = require('../utilities/database').getDb;

const mongodb = require('mongodb/index');

class User {

    constructor(name, email, cart, id) {
        this.name = name;
        this.email = email;
        this.cart = cart; // {items: []}
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        let databaseOperation;

        const db = getDb();

        if(this._id) {
            databaseOperation = db.collection('users').updateOne({_id: this._id}, {$set: this});
        } else {
            databaseOperation = db.collection('users').insertOne(this);
        }
        
        return databaseOperation
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.log(err);
        });
    }

    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cartProduct => {
            return cartProduct.productId.toString() === product._id.toString();
        });

        const updatedCartItems = [...this.cart.items];

        if (cartProductIndex < 0) {

            const newCartItem = { productId: new mongodb.ObjectId(product._id), quantity: 1 };

            updatedCartItems.push(newCartItem);

            console.log('New product added to cart');

        } else {

            updatedCartItems[cartProductIndex].quantity += 1;     
            
            console.log('Cart product quantity added by 1');
        }

        // const updatedCartItems = [{productId: product._id, quantity: 1}];

        const db = getDb();

        return db
            .collection('users')
            .updateOne({_id: this._id}, { $set: { cart: { items: updatedCartItems } } }
        );
    }

    getCart() {
        const db = getDb();

        const cartProductIds = this.cart.items.map(item => {
            return item.productId;
        });


        return db
            .collection('products')
            .find({_id: {$in: cartProductIds}})
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product, 
                        quantity: this.cart.items.find(item => {
                            return item.productId.toString() === product._id.toString();
                        }).quantity
                    }
                });
            });
    }

    deleteCartItem(productId) {
        
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        
        const db = getDb();
        
        return db
            .collection('users')
            .updateOne({_id: this._id}, { $set: {cart: { items: updatedCartItems} } }
        );
    }

    addOrder() {
        const db = getDb();

        return this.getCart()
        .then(products => {
            const newOrder = {
                items: products,
                user: {
                    _id: this._id,
                    name: this.name,
                    email: this.email
                }
            };

            return db
            .collection('orders')
            .insertOne(newOrder)
        })
        .then(result => {
            this.cart = {items: []};

            return db
            .collection('users')
            .updateOne({_id: this._id}, { $set: {cart: this.cart} });
        });
    }

    getOrders() {
        const db = getDb();

        return db
        .collection('orders')
        .find({ 'user._id': this._id })
        .toArray();
    }

    static findById(userId) {
        const db = getDb();

        return db.collection('users')
        .findOne({_id: new mongodb.ObjectId(userId)})
        .then(user => {
            return user;
        })
        .catch(err => {
            console.log(err);
        });
    }

}

module.exports = User;