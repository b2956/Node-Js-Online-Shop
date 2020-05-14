const Product = require("../Models/Product");

exports.getProducts = (req, res, next) => {

  Product.find()
    .then(products => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
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
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/"
      });
    })
    .catch(err => {
      console.log(err);
    }
  );

};

exports.getCart = (req, res, next) => {
  req.user
  .getCart()
  .then( products => {
    res.render("shop/cart", {
      pageTitle: "Your Cart",
      path: "/cart",
      products: products
    });
  })
  .catch(err => console.log(err));  
};

exports.postAddToCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product
    .findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
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

  req.user
    .deleteCartItem(prodId) 
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/cart", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.postCreateOrder = (req, res, next) => {

  req.user
    .addOrder()
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
  
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      console.log(orders);
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders
      });
    })
    .catch(err => {
      console.log(err);
    });
};