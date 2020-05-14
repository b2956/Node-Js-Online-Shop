const Product = require("../Models/Product");

// const Cart = require("../Models/Cart");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
}

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;


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

  const prodId = req.params.productId;
  
    Product
    .findById(prodId)
    .then( product => {

        if (!product) {
          return res.redirect("/");
        }

        res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;


  Product
    .findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.imageUrl = updatedImageUrl;
      product.price = updatedPrice;
      product.description = updatedDescription;

      return product.save();
    })
    .then((result) => {
      console.log("Updated product!!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    }
  );
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  Product
    .findByIdAndDelete(prodId)
    .then(result => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
}

exports.getAdminProducts = (req, res, next) => {
  Product
    .find()
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
