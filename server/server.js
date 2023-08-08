const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas/resolvers.js'); // Import the typeDefs and resolvers from the schema file
const { ApolloServer } = require('apollo-server-express');

const app = express();

// Create an instance of the Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Start the server after connecting to the database
const startServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
};

startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// If we're in production, serve the React client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Add other routes if needed


// Start the Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL server running on http://localhost:${PORT}${server.graphqlPath}`);
});
