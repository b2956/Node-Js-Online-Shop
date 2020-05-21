const { validationResult } = require('express-validator');

const Product = require("../Models/Product");

exports.getAddProduct = (req, res, next) => {
  // if (!req.session.isLoggedIn) {
  //   return res.redirect('/login');
  // }
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      product: {
        title,
        imageUrl,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

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
      console.log(err);
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
    console.log(err);
  });
}

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
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
        imageUrl: updatedImageUrl,
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
      product.imageUrl = updatedImageUrl;
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
      console.log(err);
    }
  );
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product
    .deleteOne({
      _id: productId,
      userId: req.user._id
    })
    .then(result => {
      console.log('Product deleted')
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getAdminProducts = (req, res, next) => {
  Product
    .find({ userId: req.user._id })
    // .select('title price -_id') // to choose fields you want and you don't want
    // .populate('userId', 'name') // first argument is the one to be populated and second data to be retrieved
    .then((products) => {
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",  
      });
    })
    .catch((err) => {
      console.log(err);
    });
}
