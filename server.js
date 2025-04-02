require('dotenv').config();

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema');
const resolvers = require('./resolvers');
const connectDB = require('./db');

connectDB();

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue : resolvers,
  graphiql: true,
}));

app.listen(4003, () => console.log('Server running on http://localhost:4003/graphql'));
