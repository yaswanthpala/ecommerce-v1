const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productId: { type: String, ref: 'Product', required: true },  
    quantity: { type: Number, required: true },   
    priceAtPurchase: { type: Number, required: true } 
});

const orderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: String, ref: 'Customer',  required: true },
  products: [productSchema],
  totalAmount: { type: Number, required: true },
  orderDate: { type: String , required: true },
  status: { type: String, enum: ['pending', 'completed', 'canceled'], required: true }
}, { collection: 'Orders'});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
