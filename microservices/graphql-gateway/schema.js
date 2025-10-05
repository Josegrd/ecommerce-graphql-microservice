const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    category: Category!
    createdAt: String!
    updatedAt: String!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    products: [Product!]!
  }

  type DatabaseStats {
    totalProducts: Int!
    totalCategories: Int!
    lowStockProducts: Int!
    databaseType: String!
  }

  type ServiceHealth {
    status: String!
    service: String!
    uptime: Float!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int!
    categoryId: ID!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stock: Int
    categoryId: ID
  }

  type Query {
    # Product queries
    products: [Product!]!
    product(id: ID!): Product
    productsByCategory(categoryId: ID!): [Product!]!
    searchProducts(keyword: String!): [Product!]!

    # Category queries
    categories: [Category!]!
    category(id: ID!): Category

    # Database queries
    databaseStats: DatabaseStats!

    # Health check
    healthCheck: String!
    servicesHealth: [ServiceHealth!]!
  }

  type Mutation {
    # Product CRUD operations
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Product!

    # Stock management
    updateProductStock(productId: ID!, stock: Int!): Product!
  }
`;

module.exports = typeDefs;