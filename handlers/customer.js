const  Customer = require('../models/customerModel');
const  Order  = require('../models/orderModel');
const  Product  = require('../models/productModel');

 const getCustomerOrdersHandler = async (customerId , limit = 5, page = 1) => {
    try {
        console.log("customerId", customerId);
        const customer = await Customer.findOne({ _id: customerId });
        console.log("customer", customer);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // const orders = await Order.find({ customerId: customerId });

        const orders = await Order.aggregate([
            { $match: { customerId: customerId } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
                $project:{
                    _id: 1,
                    customerId: 1,
                    products: 1,
                    totalAmount: 1,
                    orderDate: {
                        $dateToString: {
                            format: "%Y-%m-%dT%H:%M:%SZ",
                            date: {
                                $cond: {
                                    if: { $eq: [{ $type: "$orderDate" }, "string"] },
                                    then: { $dateFromString: { dateString: "$orderDate" } },
                                    else: "$orderDate"
                                }
                            },
                            timezone: "UTC",
                        },
                    },
                    status: 1,
                }
            }
        ])
        return orders;
    } catch (err) {
        console.log("ERROR IN getCustomerOrdersHandler", err);
        throw new Error("Error retrieving customer");
    }
};

module.exports = { getCustomerOrdersHandler };