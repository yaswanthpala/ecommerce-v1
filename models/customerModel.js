const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  location: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }
}, { collection: 'Customers' });

const Customer = mongoose.model('Customer', customerSchema)
module.exports = Customer;
