const  Customer  = require('../models/customerModel');
const  Order  = require('../models/orderModel');
const  Product  = require('../models/productModel');
// const redis = require('../redisServer');

 const getCustomerSpendingHandler = async (customerId) => {
    try{
    const customer = await Customer.findOne({ _id: customerId });
    console.log("customer", customer);

    if (!customer) {
        throw new Error('Customer not found');
    }

    const customerSpending = await Customer.aggregate([
        { 
            $match: { _id: customerId }
        },
        {
            $lookup: {
                from: 'Orders',  
                localField: '_id', 
                foreignField: 'customerId', 
                as: 'orders',
            },
        },
        {
            $unwind: {
                path: '$orders', 
                // preserveNullAndEmptyArrays: true 
            },
        },
        {
            $addFields: {
                "orders.orderDate": {
                    $dateFromString: {
                        dateString: "$orders.orderDate",
                        timezone: "UTC"
                    }
                }
            }
        },
        {
            $group: {
                _id: '$_id', 
                totalSpent: { $sum: '$orders.totalAmount' },
                averageOrderValue: { $avg: '$orders.totalAmount' }, 
                lastOrderDate: { $max: '$orders.orderDate' }, 
            },
        },
        {
            $project: {
                customerId: '$_id', 
                totalSpent: 1,
                averageOrderValue: 1,
                lastOrderDate: {
                    $dateToString: {
                        format: "%Y-%m-%dT%H:%M:%SZ", 
                        date: "$lastOrderDate", 
                        timezone: "UTC", 
                    },
                },
            },
        }
    ]);
    console.log("customerSpending", customerSpending);
    if(customerSpending.length > 0){
        return customerSpending[0]
    }else{
        throw new Error('Customer spending data not found');
    }

    }catch(err){
        console.log('ERROR IN getCustomerSpendingHandler', err);
        throw new Error('Error retrieving customer spending');
    }
    
};

const getTopSellingProductsHandler = async (limit) => {
    try{
        console.log("getTopSellingProductsHandler limit", limit);
    const topSellingProducts = await Order.aggregate([
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' },
          },
        },
        {
          $sort: { totalSold: -1 },
        },
        {
          $lookup: {
            from: 'Products',
            localField: '_id',
            foreignField: '_id',
            as: 'productData',
          },
        },
        {
          $unwind: '$productData',
        },
        {
          $project: {
            productId: '$_id',
            name: '$productData.name',
            totalSold: 1,
            _id: 0,
          },
        },
        {
          $limit: limit, //limit here
        },
      ])

    console.log("topSellingProducts", topSellingProducts);

    return topSellingProducts

    }catch(err){
        console.log('ERROR IN getTopSellingProductsHandler', err);
        throw new Error('Error retrieving top selling products');
    }

};

 const getSalesAnalyticsHandler = async (startDate, endDate , inlcudePendingOrders = false) => {
    console.log("IN getSalesAnalyticsHandler",startDate, endDate);

    
    try{

        // GET FROM CACHE
    //  const cacheKey = `salesData:${startDate}-${endDate}`;

    //  const cachedData = await redis.get(cacheKey);
    // if (cachedData) {
    //   console.log('Returning cached data',cachedData);
    //   return JSON.parse(cachedData);  // Return parsed JSON data
    // }

  const start = new Date(startDate);
  const end = new Date(endDate);

  console.log('start', start);
  console.log('end', end);


  const completedOrdersCountData = await Order.aggregate([
    {
        $addFields: {
          // Convert orderDate string to Date
          orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
        }
      },
      {
        $match: {
          orderDateAsDate: {
            $gte: start,
            $lte: end 
          },
          status: "completed" 
        }
      },
    {
      $count: 'completedOrdersCount', 
    },
  ]);

  console.log('completedOrdersCountData', completedOrdersCountData);

  const completedOrdersCount = completedOrdersCountData.length > 0 ? completedOrdersCountData[0].completedOrdersCount : 0;


  console.log('completedOrdersCountData', completedOrdersCountData);

  const totalRevenueData = !inlcudePendingOrders ? await Order.aggregate([
        {
          $addFields: {
            orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
          }
        },
        {
          $match: {
            orderDateAsDate: {
              $gte: start, 
              $lte: end 
            },
            status: "completed" // Filter completed orders only
          }
        },
        {
          $group: {
            _id: null, 
            totalRevenue: { 
              $sum: "$totalAmount" 
            }
          }
        }
      ]) : await Order.aggregate([
        {
          $addFields: {
            orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
          }
        },
        {
          $match: {
            orderDateAsDate: {
              $gte: start, 
              $lte: end 
            },
          }
        },
        {
          $group: {
            _id: null, 
            totalRevenue: { 
              $sum: "$totalAmount" 
            }
          }
        }
      ]);
      

    const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

    console.log('totalRevenueData', totalRevenueData);


    const categoryBreakdownData =  !inlcudePendingOrders ?  await Order.aggregate([
        {
            $addFields: {
              orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
            }
          },
          {
            $match: {
              orderDateAsDate: {
                $gte: start, 
                $lte: end 
              },
              status: "completed" 
            }
          },
      {
        $unwind: '$products',
      },
      {
        $lookup: {
          from: 'Products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productData',
        },
      },
      {
        $unwind: '$productData', 
      },
      {
        $group: {
          _id: '$productData.category', 
          revenue: {
            $sum: {
              $multiply: ['$products.quantity', '$products.priceAtPurchase'],
            },
          },
        },
      },
      {
        $sort: { revenue: -1 }, 
      },
      {
        $project: {
          category: '$_id',
          revenue: 1,
          _id: 0,
        },
      }
    ]) : await Order.aggregate([
        {
            $addFields: {
              orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
            }
          },
          {
            $match: {
              orderDateAsDate: {
                $gte: start, 
                $lte: end 
              },
            }
          },
        {
          $unwind: '$products',
        },
        {
          $lookup: {
            from: 'Products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productData',
          },
        },
        {
          $unwind: '$productData', 
        },
        {
          $group: {
            _id: '$productData.category', 
            revenue: {
              $sum: {
                $multiply: ['$products.quantity', '$products.priceAtPurchase'],
              },
            },
          },
        },
        {
          $sort: { revenue: -1 },
        },
        {
            $project: {
              category: '$_id',
              revenue: 1,
              _id: 0,
            },
        }
      ])

    console.log('categoryBreakdownData', categoryBreakdownData);

    const salesAnalytics = {
      totalRevenue,
      completedOrders: completedOrdersCount,
      categoryBreakdown: categoryBreakdownData,
    };

    console.log('salesAnalytics', salesAnalytics);

    //SET CACHE
    console.log( 'process.env.CACHE_TTL' , process.env.CACHE_TTL);
    const cacheTTL = parseInt(process.env.CACHE_TTL) || 3600
    console.log('cacheTTL', cacheTTL);
    // await redis.setex(cacheKey, cacheTTL, JSON.stringify(analyticsData));

    return salesAnalytics;  
    }catch(err){
        console.log('ERROR IN getSalesAnalyticsHandler', err);
        throw new Error('Error retrieving sales analytics');
    }
    
    }


    const getSalesAnalyticsHandlerSafe = async (startDate, endDate , inlcudePendingOrders = false) => {
        console.log("IN getSalesAnalyticsHandler",startDate, endDate);
        try{
      const start = new Date(startDate);
      const end = new Date(endDate);
    
      console.log('start', start);
      console.log('end', end);
    
    
      const completedOrdersCountData = await Order.aggregate([
        {
            $addFields: {
              // Convert orderDate string to Date
              orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
            }
          },
          {
            $match: {
              orderDateAsDate: {
                $gte: start,
                $lte: end 
              },
              status: "completed" 
            }
          },
        {
          $count: 'completedOrdersCount', 
        },
      ]);
    
      console.log('completedOrdersCountData', completedOrdersCountData);
    
      const completedOrdersCount = completedOrdersCountData.length > 0 ? completedOrdersCountData[0].completedOrdersCount : 0;
    
    
      console.log('completedOrdersCountData', completedOrdersCountData);
    
      const totalRevenueData = !inlcudePendingOrders ? await Order.aggregate([
            {
              $addFields: {
                orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
              }
            },
            {
              $match: {
                orderDateAsDate: {
                  $gte: start, 
                  $lte: end 
                },
                status: "completed" // Filter completed orders only
              }
            },
            {
              $group: {
                _id: null, 
                totalRevenue: { 
                  $sum: "$totalAmount" 
                }
              }
            }
          ]) : await Order.aggregate([
            {
              $addFields: {
                orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
              }
            },
            {
              $match: {
                orderDateAsDate: {
                  $gte: start, 
                  $lte: end 
                },
              }
            },
            {
              $group: {
                _id: null, 
                totalRevenue: { 
                  $sum: "$totalAmount" 
                }
              }
            }
          ]);
          
    
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
    
        console.log('totalRevenueData', totalRevenueData);
    
    
        const categoryBreakdownData =  !inlcudePendingOrders ?  await Order.aggregate([
            {
                $addFields: {
                  orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
                }
              },
              {
                $match: {
                  orderDateAsDate: {
                    $gte: start, 
                    $lte: end 
                  },
                  status: "completed" 
                }
              },
          {
            $unwind: '$products',
          },
          {
            $lookup: {
              from: 'Products',
              localField: 'products.productId',
              foreignField: '_id',
              as: 'productData',
            },
          },
          {
            $unwind: '$productData', 
          },
          {
            $group: {
              _id: '$productData.category', 
              revenue: {
                $sum: {
                  $multiply: ['$products.quantity', '$products.priceAtPurchase'],
                },
              },
            },
          },
          {
            $sort: { revenue: -1 }, 
          },
          {
            $project: {
              category: '$_id',
              revenue: 1,
              _id: 0,
            },
          }
        ]) : await Order.aggregate([
            {
                $addFields: {
                  orderDateAsDate: { $dateFromString: { dateString: "$orderDate" } }
                }
              },
              {
                $match: {
                  orderDateAsDate: {
                    $gte: start, 
                    $lte: end 
                  },
                }
              },
            {
              $unwind: '$products',
            },
            {
              $lookup: {
                from: 'Products',
                localField: 'products.productId',
                foreignField: '_id',
                as: 'productData',
              },
            },
            {
              $unwind: '$productData', 
            },
            {
              $group: {
                _id: '$productData.category', 
                revenue: {
                  $sum: {
                    $multiply: ['$products.quantity', '$products.priceAtPurchase'],
                  },
                },
              },
            },
            {
              $sort: { revenue: -1 },
            },
            {
                $project: {
                  category: '$_id',
                  revenue: 1,
                  _id: 0,
                },
            }
          ])
    
        console.log('categoryBreakdownData', categoryBreakdownData);
    
        const salesAnalytics = {
          totalRevenue,
          completedOrders: completedOrdersCount,
          categoryBreakdown: categoryBreakdownData,
        };
    
        console.log('salesAnalytics', salesAnalytics);
    
        return salesAnalytics;  
        }catch(err){
            console.log('ERROR IN getSalesAnalyticsHandler', err);
            throw new Error('Error retrieving sales analytics');
        }
        
        }

module.exports = {
    getCustomerSpendingHandler,
    getTopSellingProductsHandler,
    getSalesAnalyticsHandler
}