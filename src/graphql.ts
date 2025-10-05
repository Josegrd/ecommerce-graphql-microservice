import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      stock
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      stock
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      description
    }
  }
`;

export const GET_DATABASE_STATS = gql`
  query GetDatabaseStats {
    databaseStats {
      totalProducts
      totalCategories
      lowStockProducts
      databaseType
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($keyword: String!) {
    searchProducts(keyword: $keyword) {
      id
      name
      description
      price
      stock
      category {
        id
        name
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: ID!) {
    productsByCategory(categoryId: $categoryId) {
      id
      name
      description
      price
      stock
      category {
        id
        name
      }
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      stock
      createdAt
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      description
      price
      stock
      updatedAt
      category {
        id
        name
        description
      }
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
      name
    }
  }
`;

export const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($productId: ID!, $stock: Int!) {
    updateProductStock(productId: $productId, stock: $stock) {
      id
      name
      stock
      updatedAt
    }
  }
`;