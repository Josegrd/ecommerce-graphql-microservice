const resolvers = {
  Query: {
    healthCheck: async (_, __, { services }) => {
      try {
        const catalogHealth = await services.catalogService.getHealth();
        return ` GraphQL Gateway is running! Services: Catalog (${catalogHealth.status}))`;
      } catch (error) {
        return ` GraphQL Gateway is running but service health check failed: ${error.message}`;
      }
    },

    servicesHealth: async (_, __, { services }) => {
      try {
        return await services.getHealthStatus();
      } catch (error) {
        throw new Error(`Failed to fetch services health: ${error.message}`);
      }
    },

    databaseStats: async (_, __, { services }) => {
      try {
        return await services.catalogService.getStatistics();
      } catch (error) {
        throw new Error(`Failed to fetch database statistics: ${error.message}`);
      }
    },

    products: async (_, __, { services }) => {
      try {
        const products = await services.catalogService.getAllProducts();
        console.log("Products fetched from catalog:", products);
        return products;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }
    },

    product: async (_, { id }, { services }) => {
      try {
        const product = await services.catalogService.getProductById(id);
        if (!product) {
          throw new Error(`Product with ID ${id} not found`);
        }
        return product;
      } catch (error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      }
    },

    productsByCategory: async (_, { categoryId }, { services }) => {
      try {
        return await services.catalogService.getProductsByCategory(categoryId);
      } catch (error) {
        throw new Error(`Failed to fetch products by category: ${error.message}`);
      }
    },

    searchProducts: async (_, { keyword }, { services }) => {
      try {
        if (!keyword || keyword.trim().length === 0) {
          throw new Error("Search keyword cannot be empty");
        }
        return await services.catalogService.searchProducts(keyword);
      } catch (error) {
        throw new Error(`Failed to search products: ${error.message}`);
      }
    },

    categories: async (_, __, { services }) => {
      try {
        return await services.catalogService.getAllCategories();
      } catch (error) {
        throw new Error(`Failed to fetch categories: ${error.message}`);
      }
    },

    category: async (_, { id }, { services }) => {
      try {
        const category = await services.catalogService.getCategoryById(id);
        if (!category) {
          throw new Error(`Category with ID ${id} not found`);
        }
        return category;
      } catch (error) {
        throw new Error(`Failed to fetch category: ${error.message}`);
      }
    }
  },

  Mutation: {
    createProduct: async (_, { input }, { services }) => {
      try {
        if (!input.name || input.name.trim().length === 0) {
          throw new Error("Product name is required");
        }
        if (input.price <= 0) {
          throw new Error("Product price must be greater than 0");
        }
        if (input.stock < 0) {
          throw new Error("Product stock cannot be negative");
        }

        return await services.catalogService.createProduct(input);
      } catch (error) {
        throw new Error(`Failed to create product: ${error.message}`);
      }
    },

    updateProduct: async (_, { id, input }, { services }) => {
      try {
        if (input.price !== undefined && input.price <= 0) {
          throw new Error("Product price must be greater than 0");
        }
        if (input.stock !== undefined && input.stock < 0) {
          throw new Error("Product stock cannot be negative");
        }

        return await services.catalogService.updateProduct(id, input);
      } catch (error) {
        throw new Error(`Failed to update product: ${error.message}`);
      }
    },

    deleteProduct: async (_, { id }, { services }) => {
      try {
        return await services.catalogService.deleteProduct(id);
      } catch (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      }
    },

    updateProductStock: async (_, { productId, stock }, { services }) => {
      try {
        if (stock < 0) {
          throw new Error("Product stock cannot be negative");
        }

        const product = await services.catalogService.updateProductStock(productId, stock);
        
        return product;
      } catch (error) {
        throw new Error(`Failed to update product stock: ${error.message}`);
      }
    }
  },
  
  // Add Product type resolver to resolve the category field
  Product: {
    category: async (product, _, { services }) => {
      try {
        // If the product already has a complete category object, return it
        if (product.category && product.category.name) {
          return product.category;
        }
        
        // Otherwise fetch the category by ID
        const categoryId = product.categoryId || (product.category ? product.category.id : null);
        if (!categoryId) {
          throw new Error("Category ID not found");
        }
        
        const category = await services.catalogService.getCategoryById(categoryId);
        return category;
      } catch (error) {
        console.error(`Failed to resolve category for product ${product.id}:`, error);
        throw new Error(`Failed to resolve category: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;