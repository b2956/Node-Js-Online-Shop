const { validationResult } = require('express-validator');

const Product = require("../Models/Product");
const errorCall = require('../utilities/errorCall');
const fileHelper = require('../utilities/fileHelper');

const itemsPerPage = 2;

exports.getAddProduct = (req, res, next) => {
  // if (!req.session.isLoggedIn) {
  //   return res.redirect('/login');
  // }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product/",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;
  const errors = validationResult(req);

  // console.log(image);
  if(!image || !errors.isEmpty()) {
    let errorMessage, validationErrors;

    !image ? errorMessage = 'Attached file is not an image' :errorMessage = errors.array()[0].msg;

    errors.isEmpty() ? validationErrors = [] : validationErrors = errors.array();
    
    return res.status(422).render('admin/edit-product', {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage,
      validationErrors
    });
  }

  const imageUrl = image.path;

  const product = new Product({
    title,
    imageUrl,
    price,
    description,
    userId
  });

  product.save()
    .then((result) => {
      //console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // return res.status(500).render('admin/edit-product', {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title,
      //     imageUrl,
      //     price,
      //     description,
      //   },
      //   errorMessage: 'Database operation failed, please try again',
      //   validationErrors: []
      // });
      // res.redirect('/500');
      return errorCall(next, err);
    });
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  
  Product
  .findById(productId)
  .then( product => {
      if (!product || product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  })
  .catch((err) => {
    return errorCall(next, err);
  });
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.file;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);


  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDescription,
        _id: productId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Product
    .findById(productId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      if(updatedImage) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }
      product.price = updatedPrice;
      product.description = updatedDescription;

      return product
      .save()
      .then((result) => {
        console.log("Updated product!!");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      return errorCall(next, err);
    }
  );
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

    Product
    .findById(productId)
    .then(product => {
      if(!product) {
        return next(new Error('Product not found'));
      }

      if(product.userId.toString() === req.user._id.toString()) {
        fileHelper.deleteFile(product.imageUrl);
      }
      
      return Product
      .deleteOne({
        _id: productId,
        userId: req.user._id
      })
    })
    .then(result => {
      console.log('Product deleted')
      res.redirect("/admin/products");
    })
    .catch((err) => {
      return errorCall(next, err);
    });
}

exports.getAdminProducts = (req, res, next) => {
  let page  = +req.query.page || 1;
  let totalProducts;

  Product
    .find()
    .countDocuments()
    .then(productsNumber => {

      totalProducts = productsNumber;

      return Product
        .find({ userId: req.user._id })
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .then((products) => {
        
          res.render("admin/products", {
            prods: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
            currentPage: page,
            hasNextPage: itemsPerPage * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page -1,
            lastPage: Math.ceil(totalProducts / itemsPerPage) 
          });
        });
    })
    .catch((err) => {
      return errorCall(next, err);
    });
}
