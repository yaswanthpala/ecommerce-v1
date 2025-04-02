const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
}, { collection: 'Products' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
