const mongoose = require('mongoose');
const Product = require('./Product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cartProduct => {
        return cartProduct.productId.toString() === product._id.toString();
    });
        
    const updatedCartItems = [...this.cart.items];
        
    if (cartProductIndex < 0) {
        
        const newCartItem = { productId: product._id, quantity: 1 };
        
        updatedCartItems.push(newCartItem);
        
        console.log('New product added to cart');
        
    } else {
        
        updatedCartItems[cartProductIndex].quantity += 1;     
                    
        console.log('Cart product quantity added by 1');
    }

    this.cart.items = updatedCartItems;

    return this.save();
}

// userSchema.methods.getCart = function() {
//     const cartItemsId = this.cart.items.map(item => {
//         return item.productId
//     })
    
//     return Promise.all(
//         cartItemsId.map((itemId, index) => {
//             const quantity = this.cart.items[index].quantity;

//             return Product.findById(itemId)
//             .then(product => {
//                 product = {
//                     ...product._doc,
//                     quantity
//                 }

//                 return product
//             });        
//     }))

// }

userSchema.methods.deleteCartItem = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString()
    });

    this.cart.items = updatedCartItems;

    return this.save()
}

userSchema.methods.emptyCart = function() {
    this.cart = {
        items: []
    }

    this.save();
}

module.exports = mongoose.model('User', userSchema);