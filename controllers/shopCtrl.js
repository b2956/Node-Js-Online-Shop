const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')('sk_test_aAffjfCHG9Y22Mzdbw1Sb7ji00vHCBjBNv');

const Product = require("../Models/Product");
const Order = require('../Models/Order');
const errorCall = require('../utils/errorCall');
const rootDir = require('../utils/path');
const deleteFile = require('../utils/fileHelper');

const itemsPerPage = 2;

exports.getIndex = (req, res, next) => {
  // console.log(req.session.isLoggedIn);
  let page  = +req.query.page || 1;
  let totalProducts;

  Product
    .find()
    .countDocuments()
    .then(productsNumber => {

      totalProducts = productsNumber;

      return Product
        .find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .then(products => {
          // console.log(products);
          res.render("shop/product-list", {
            prods: products,
            pageTitle: "All Products",
            path: "/",
            currentPage: page,
            hasNextPage: itemsPerPage * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page -1,
            lastPage: Math.ceil(totalProducts / itemsPerPage)
          });
        });
    })
    .catch(err => {
      return errorCall(next, err);
    }
  );

};

exports.getProducts = (req, res, next) => {
  let page  = +req.query.page || 1;
  let totalProducts;

  Product
    .find()
    .countDocuments()
    .then(productsNumber => {

      totalProducts = productsNumber;

      return Product
        .find()
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .then(products => {
          // console.log(products);
          res.render("shop/product-list", {
            prods: products,
            pageTitle: "All Products",
            path: "/products",
            currentPage: page,
            hasNextPage: itemsPerPage * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page -1,
            lastPage: Math.ceil(totalProducts / itemsPerPage)
          });
        })
    })
    .catch(err => {
      return errorCall(next, err);
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
      return errorCall(next, err);
    }
  );
};

exports.getCart = (req, res, next) => {
  // console.log(req.user);

  req.user
    .populate('cart.items.productId')
    .execPopulate()
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
      });
    })
    .catch(err => {
      return errorCall(next, err);
    });
};

exports.postAddToCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product
    .findById(prodId)
    .then(product => {
      return product
    })
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      // console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      return errorCall(next, err);
  });
};

exports.postDeleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;

    req.user
      .deleteCartItem(prodId)
      .then(result => {
        console.log('Product deleted from cart');
        res.redirect('/cart');
      })
      .catch(err => {
        return errorCall(next, err);
      });
};

// exports.postCreateOrder = (req, res, next) => {

//   req.user
//     .populate('cart.items.productId')
//     .execPopulate()
//     .then( user => {

//       return products = user.cart.items.map(item => {
//         const quantity = item.quantity;
//         return { 
//           product: {
//             ...item.productId._doc
//           },
//           quantity
//         }
//       })
//     })
//     .then(products => {

//       // console.log(products);

//       const order = new Order({
//         user: {
//           userId: req.user._id,
//           email: req.user.email
//         },
//         products
//       });

//       return order
//     })
//     .then(order => {
//       // console.log(order);
//       order.save()
//     })
//     .then(result => {
//       return req.user.emptyCart();
//     })
//     .then(result => {
//       console.log('order created, cart emptied')
//       res.redirect('/orders');
//     })
//     .catch(err => {
//       return errorCall(next, err);
//     });
  
// };

exports.getOrders = (req, res, next) => {
    Order.find({
      'user.userId': req.user._id
    })
    .then(orders => {
      // console.log(orders);
      res.render("shop/orders", {
        pageTitle: "Your Orders",
        path: "/orders",
        orders: orders,
      });
    })
    .catch(err => {
      return errorCall(next, err);
    });
};

exports.getOrderInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order
    .findById(orderId)
    .then(order => {

      if(!order) {
        return next(new Error('No order found by that Id'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Order does not belong to te current user!'));
      }

      const invoiceName =  `invoice-${orderId}.pdf`;
      const invoicePath = path.join(rootDir, 'data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-disposition': `inline; filename="${invoiceName}"`
      });

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      });
      pdfDoc.text('----------------------------');

      order.products.forEach(orderItem => {
        pdfDoc.fontSize(16).text(`${orderItem.product.title} - Quantity: ${orderItem.quantity} - Total: $${orderItem.quantity * orderItem.product.price}`)
      });

      pdfDoc.text('----------------------------');

      const orderTotalPrice = order.products.reduce((accumulator, orderItem) => {
        return (accumulator + (orderItem.quantity * orderItem.product.price));
      }, 0);

      pdfDoc.fontSize(20).text(`Total Price: $${orderTotalPrice}`)

      pdfDoc.end();

      // fs.readFile( invoicePath, (err, data) => {
      //     if (err) {
      //       return next(err);
      //     }
      //     res.writeHead(200, {
      //       'Content-Type': 'application/pdf',
      //       'Content-disposition': `inline; filename="${invoiceName}"`
      //     })
      //     res.end(data);
      //   }
      // );
      // const file = fs.createReadStream(invoicePath);
      // res.writeHead(200, {
      //   'Content-Type': 'application/pdf',
      //   'Content-disposition': `inline; filename="${invoiceName}"`
      // });
      // file.pipe(res);
    })
    .catch(err => {
      return errorCall(next, err);
    });
  
}

exports.getCheckout = (req, res, next) => {
  let products, totalPrice;


  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then( user => {

      products = user.cart.items.map(item => {
        const quantity = item.quantity;
        return { 
          ... item.productId._doc,
          quantity
        }
      });

      totalPrice = products.reduce((accumulator, product) => {
        return (accumulator + (product.quantity * product.price));
      }, 0);

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(product => {
          return {
            name: product.title,
            description: product.description,
            amount: product.price * 100,
            currency: 'usd',
            quantity: product.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then(session => {
      res.render("shop/checkout", {
        pageTitle: "Checkout",
        path: "/checkout",
        products,
        totalPrice,
        sessionId: session.id
      });
    })
    .catch(err => {
      return errorCall(next, err);
    })
};

exports.getCheckoutSuccess = (req, res, next) => {

  req.user
    .populate('cart.items.productId')
    .execPopulate()
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
          userId: req.user._id,
          email: req.user.email
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
      return req.user.emptyCart();
    })
    .then(result => {
      console.log('order created, cart emptied')
      res.redirect('/orders');
    })
    .catch(err => {
      return errorCall(next, err);
    });
  
};