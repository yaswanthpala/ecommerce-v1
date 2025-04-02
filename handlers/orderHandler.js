const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');
const Product = require('../models/productModel');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');


const createOrder = async ( customerId, products) => {
  try {
    console.log('Creating order for customer:', customerId);
  
    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
      throw new Error('Customer is not registered with us');
    }

    let productQuantities = {};
    let productIds = [];
    products.forEach(p => {
      productQuantities[`${p.productId}`] = p.quantity;
      productIds.push(p.productId);
    });

    console.log('productIds:', productIds);
    console.log('productQuantities:', productQuantities);


    
    const productValidation = await Product.aggregate([
      {
        $match: {
          _id: { $in: productIds },
        },
      },
      {
        $project: {
          _id: 1,
          stock: 1,
          price: 1, 
        },
      },
    ]);

    console.log('productValidation:', productValidation);

    
    const missingProductIds = productIds.filter(
    id => !productValidation.find(p => p._id.toString() === id)
    );

    console.log('missingProductIds:', missingProductIds);
    
    if (missingProductIds.length > 0) {
      throw new Error(`Product Not Available, productIDs: ${missingProductIds.join(', ')}`);
    }

    const outOfStockProducts = productValidation.filter(p => p.stock < productQuantities[p._id.toString()]);
    if (outOfStockProducts.length > 0) {
      throw new Error(`Product is Out of Stock, productIDs: ${outOfStockProducts.map(p => p._id).join(', ')}`);
    }

    console.log("VALIDATION PASSED");
    
    let totalAmount = 0;
    const productDetails = products.map(p => {
      const productData = productValidation.find(prod => prod._id.toString() === p.productId);
      const consideredPrice = p.priceAtPurchase || productData.price;
      totalAmount += 
    //   productData.price * p.quantity;
    consideredPrice * p.quantity;
      return {
        productId: p.productId,
        quantity: p.quantity,
        priceAtPurchase: consideredPrice,
      };
    });

    console.log('productDetails:', productDetails);
    console.log('totalAmount:', Number(totalAmount.toFixed(3)));
    console.log('orderDate',moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS'));

    const newOrder =  new Order({
        _id: uuidv4(), 
        customerId,
        products,
        totalAmount: Number(totalAmount.toFixed(3)),
        orderDate: `${moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSS')}`,
        status: 'pending' 
      });

    const savedOrder = await newOrder.save();

    console.log('Order created:', savedOrder);

    return savedOrder;

  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error(error.message);
  }
};

module.exports = { createOrder };

