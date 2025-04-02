const { buildSchema } = require("graphql");

const schema = buildSchema(`

    type Customer {
      _id: ID!
      name: String!
      email: String!
      age: Int!
      location: String!
      gender: Gender!
    }

    enum Gender {
      Male
      Female
      Other
    }

    type Product {
      _id: ID!
      name: String!
      category: String!
      price: Float!
      stock: Int!
    }

    type ProductOrder {
        productId: String!
        quantity: Int!
        priceAtPurchase: Float!
    }

    type Order {
        _id: ID!
        customerId: String!
        products: [ProductOrder]
        totalAmount: Float!
        orderDate: String!
        status: String!
        }

    type CustomerSpending {
        customerId: String!
        totalSpent: Float!
        averageOrderValue: Float!
        lastOrderDate : String
    } 
    
    type TopProduct {
        productId: String!
        name: String!
        totalSold: Int!
    }

    type CategoryBreakdown {
        category: String!
        revenue: Float!
    }

    type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryBreakdown]
    }



   input ProductInput {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
   }


   type Query {
    getCustomerOrders(customerId: ID! ,page: Int , limit: Int ): [Order]
    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
  }

  type Mutation {
    createOrder(customerId: String!, products: [ProductInput]!): Order
  }

  `);

module.exports = schema;



