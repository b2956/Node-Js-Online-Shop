const Product = require("../Models/Product");
const Order = require('../Models/Order');
const User = require('../Models/User');

exports.getProducts = (req, res, next) => {

  Product.find()
    .then(products => {
      // console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    }
  );
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  
  Product
    .findById(prodId)
    .then( product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err)
    }
  );
};

exports.getIndex = (req, res, next) => {

  Product.find()
    .then(products => {
      // console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/",
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    }
  );

};

exports.getCart = (req, res, next) => {
  const { userId } = req.session.user

  User.findById(userId)
  .then(user => {
    return user
    .populate('cart.items.productId')
    .execPopulate()
  }) 
  .then( user => {

    const products = user.cart.items.map(item => {
      const quantity = item.quantity;
      return { 
        ... item.productId._doc,
        quantity
      }
    });

    res.render("shop/cart", {
      pageTitle: "Your Cart",
      path: "/cart",
      products: products,
      isLoggedIn: req.session.isLoggedIn
    });
  })
  .catch(err => console.log(err));  
};

exports.postAddToCart = (req, res, next) => {
  const prodId = req.body.productId;
  let product;

  Product
    .findById(prodId)
    .then(retrievedProduct => {
      return product = retrievedProduct;
    })
    .then(result => {
      return User.findById(req.session.user.userId)
    })
    .then(user => {
      return user.addToCart(product);
    })
    .then(result => {
      // console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
  });
};

exports.postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  const { userId } = req.session.user;

  User
    .findById(userId)
    .then(user => {
      user.deleteCartItem(prodId)
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/cart", {
    pageTitle: "Checkout",
    path: "/checkout",
    isLoggedIn: req.session.isLoggedIn
  });
};

exports.postCreateOrder = (req, res, next) => {
  let products;
  const { userId } = req.session.user

  User
  .findById(userId)
  .then(user => {
    return user
    .populate('cart.items.productId')
    .execPopulate()
  })
  .then( user => {

    return products = user.cart.items.map(item => {
      const quantity = item.quantity;
      return { 
        product: {
          ...item.productId._doc
        },
        quantity
      }
    })
  })
  .then(products => {

    // console.log(products);

    const order = new Order({
      user: {
        userId: req.session.user._id,
        name: req.session.user.name,
        email: req.session.user.email
      },
      products
    });

    return order
  })
  .then(order => {
    // console.log(order);
    order.save()
  })
  .then(result => {
    return req.session.user.emptyCart();
  })
  .then(result => {
    console.log('order created, cart emptied')
    res.redirect('/orders');
  })
  .catch(err => console.log(err));
  
};

exports.getOrders = (req, res, next) => {
    Order.find({
      'user.userId': req.session.user._id
    })
    .then(orders => {
      // console.log(orders);
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
        isLoggedIn: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};