require('dotenv').config();

const express = require('express');
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const validRequest = require('../index');

// create application
const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// data
const products = [
  { _id: ObjectId(), name: 'Product 1', category: 'Category 1', price: 1.23 },
  { _id: ObjectId(), name: 'Product 2', category: 'Category 2', price: 4.56 },
  { _id: ObjectId(), name: 'Product 3', category: 'Category 3', price: 7.89 },
];
const getProduct = (productId) => {
  return products.find((product) => product._id.equals(productId));
};
const updateProduct = (productId, update) => {
  const product = products.find((p) => p._id.equals(productId));
  if (product) {
    for (const key in update) {
      product[key] = update[key];
    }
  }
};

// schema
const updateProductSchema = {
  params: Joi.object({
    productId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/, 'ObjectId')
      .required(),
  }),
  body: Joi.object({
    name: Joi.string().trim().required(),
    category: Joi.string().trim().required(),
    price: Joi.number().min(0).precision(2).required(),
  }),
};

// routes
app.get('/', (req, res) => {
  return res.redirect('/api/product/list');
});
app.get('/api/product/list', (req, res) => {
  return res.json(products);
});
app.post(
  '/api/product/:productId',
  validRequest(updateProductSchema),
  (req, res, next) => {
    const productId = new ObjectId(req.params.productId);
    const update = req.body;

    const product = getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: `Product ${productId} not found!` });
    } else {
      updateProduct(productId, update);
      return res.json({ success: 'Product Updated!' });
    }
  }
);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({ error: err });
});

// start application
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening at http://${hostname}:${port}`);
});
