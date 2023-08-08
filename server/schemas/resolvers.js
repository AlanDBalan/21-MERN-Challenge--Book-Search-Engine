const { gql } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const typeDefs = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int!
    savedBooks: [Book]!
  }

  type Book {
    bookId: String!
    authors: [String]!
    description: String!
    title: String!
    image: String!
    link: String!
  }

  type Auth {
    token: String!
    user: User!
  }

  type Query {
    me: User!
    hello: String!
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }

  input BookInput {
    authors: [String]!
    description: String!
    title: String!
    bookId: String!
    image: String!
    link: String!
  }

`;


// Define your resolvers for the Query type
const resolvers = {
  Query: {
    hello: () => 'Hello, World!',
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error('No user found with this email address');
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new Error('Incorrect password');
      }

      const token = signToken(user);

      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $push: { savedBooks: bookData } },
            { new: true }
          );

          return updatedUser;
        } catch (err) {
          console.error(err);
          throw new Error('Something went wrong while saving the book');
        }
      } else {
        throw new Error('You need to be logged in to perform this action');
      }
    },

    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        try {
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );

          return updatedUser;
        } catch (err) {
          console.error(err);
          throw new Error('Something went wrong while removing the book');
        }
      } else {
        throw new Error('You need to be logged in to perform this action');
      }
    },
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
