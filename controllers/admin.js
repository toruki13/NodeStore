const Product = require('../models/product');
const fileHelper = require('../utils/fileFunctions');
const { validationResult } = require('express-validator');
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    docTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    /* oldInput: { title: '', price: '', description: '', imageUrl: '' }, */
    validationErrors: [],
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id /* authorization */ })
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        docTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  /* console.log(editMode); */
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        console.log('no product');
        return res.redirect('/admin/products');
      }
      res.render('admin/edit-product', {
        docTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage: null,
        hasError: false,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
      /*  return res.status(500).render('/500', {
        error: error,
      }); */
    });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (!image) {
    /* manual push of the error object since it cant be done with the package */
    errors.errors.push({
      value: ' ',
      msg: 'Invalid Image check size and/or format',
      param: 'Image',
      location: 'body',
    });
  }
  if (!errors.isEmpty()) {
    const { param } = errors.array()[0];
    console.log(errors);
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: param === 'title' ? '' : title,
        price: param === 'price' ? '' : price,
        description: param === 'description' ? '' : description,
      },
      errorMessage: errors.array(),

      validationErrors: errors.array(),
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl: image.path,
    userId: req.user /* ._id  <--mongoose will pick this object */,
    userName: req.user.userName,
  });

  product
    .save()
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch((err) => {
      /* console.log(err);
      return res.status(500).render('admin/edit-product', {
        docTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        product: {
          title: param === 'title' ? '' : title,
          price: param === 'price' ? '' : price,
          description: param === 'description' ? '' : description,
          imageUrl: param == 'imageUrl' ? '' : imageUrl,
        },
        errorMessage: 'Data Base Operation Error Please try again',

        validationErrors: [],
      }); */
      /*   res.redirect('/500'); */
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;

  const errors = validationResult(req);

 

  if (!errors.isEmpty()) {
    console.log('errors');
    const { value, msg, param } = errors.array()[0];
    return res.status(422).render('admin/edit-product', {
      docTitle: 'Add Product',
      path: '/admin/add-product',
      editing: true,
      hasError: true,
      product: {
        title: param === 'title' ? '' : title,
        price: param === 'price' ? '' : price,
        description: param === 'description' ? '' : description,
      },
      errorMessage: errors.array(),

      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      console.log('made it into the product find');
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      if (image) {
        console.log('imag exist');
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.title = title;
      product.price = price;
      product.price = price;
      product.description = description;

      return product
        .save()
        .then((result) => {
          res.redirect('/admin/products');
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('product not found'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('Deleted');
      res.redirect('/admin/products');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
