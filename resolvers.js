
const { getCustomerSpendingHandler, getTopSellingProductsHandler, getSalesAnalyticsHandler } = require('./handlers/analytics');
const { getCustomerOrdersHandler } =  require('./handlers/customer')
const { createOrder } = require('./handlers/orderHandler');


const resolvers = {
  getCustomerSpending: async ({ customerId }) => {
        try {
            return await getCustomerSpendingHandler(customerId);
        } catch (err) {
            console.log("ERROR IN getCustomerSpending", err);
          throw new Error("Error retrieving customer");
        }
      },
  getTopSellingProducts: async ({ limit}) => { 
    try {
        return await getTopSellingProductsHandler(limit);
    } catch (err) {
        console.log("ERROR IN getTopSellingProduct", err);
      throw new Error("Error retrieving top selling products");
    }
  },
  getSalesAnalytics: async ({ startDate, endDate }) => {    
    console.log("startDate", startDate);
    console.log("endDate", endDate);
    try {
        return await getSalesAnalyticsHandler(startDate, endDate);
    }
    catch (err) {
      throw new Error("Error retrieving sales analytics");
    }
  },

  getCustomerOrders: async ({ customerId, limit, page }) => {
    try {
        const pageLimit = limit || 5;
        const currentPage = page || 1;
      return await getCustomerOrdersHandler(customerId , pageLimit, currentPage);
    } catch (err) {
      throw new Error("Error retrieving customer orders");
    }
  },
  createOrder: async ({ customerId, products }) => {
    console.log("customerId", customerId);
    console.log("products", products);
    try {
      return await createOrder(customerId, products);
    } catch (err) {
      throw new Error("Error creating order");
    }
  },
};

module.exports = resolvers;