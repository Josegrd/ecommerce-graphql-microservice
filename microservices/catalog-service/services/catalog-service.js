const crypto = require('crypto');
const databaseManager = require('../database/config');

function generateUUID() {
  return crypto.randomUUID();
}

class CatalogService {
  constructor() {
    this.dbType = process.env.DB_TYPE || 'dummy';
  }

  async simulateNetworkDelay(min = 100, max = 300) {
    if (process.env.NODE_ENV === 'development') {
      const delay = Math.floor(Math.random() * (max - min) + min);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  formatProduct(product) {
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        description: product.category.description
      } : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };
  }

  formatCategory(category) {
    if (!category) return null;
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      products: category.products ? category.products.map(this.formatProduct) : []
    };
  }

  async getAllProducts() {
    try {
      await this.simulateNetworkDelay();
      const { Product, Category } = databaseManager.getModels();
      
      const products = await Product.findAll({
        include: [{
          model: Category,
          as: 'category'
        }],
        order: [['createdAt', 'DESC']]
      });

      return products.map(product => this.formatProduct(product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      await this.simulateNetworkDelay(50);
      const { Product, Category } = databaseManager.getModels();
      
      const product = await Product.findByPk(id, {
        include: [{
          model: Category,
          as: 'category'
        }]
      });

      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      return this.formatProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductsByCategory(categoryId) {
    try {
      await this.simulateNetworkDelay();
      const { Product, Category } = databaseManager.getModels();
      
      const products = await Product.findAll({
        where: { categoryId },
        include: [{
          model: Category,
          as: 'category'
        }],
        order: [['name', 'ASC']]
      });

      return products.map(product => this.formatProduct(product));
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  }

  async searchProducts(keyword) {
    try {
      await this.simulateNetworkDelay();
      const { Product, Category } = databaseManager.getModels();
      const { Op } = require('sequelize');
      
      const products = await Product.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${keyword}%` } },
            { description: { [Op.iLike]: `%${keyword}%` } }
          ]
        },
        include: [{
          model: Category,
          as: 'category'
        }],
        order: [['name', 'ASC']]
      });

      return products.map(product => this.formatProduct(product));
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  async createProduct(input) {
    try {
      await this.simulateNetworkDelay(150);
      const { Product, Category } = databaseManager.getModels();

      const category = await Category.findByPk(input.categoryId);
      if (!category) {
        throw new Error(`Category with ID ${input.categoryId} not found`);
      }

      const product = await Product.create({
        id: generateUUID(),
        ...input
      });

      const productWithCategory = await Product.findByPk(product.id, {
        include: [{
          model: Category,
          as: 'category'
        }]
      });

      console.log(`✅ Created product: ${product.name}`);
      return this.formatProduct(productWithCategory);
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async updateProduct(id, input) {
    try {
      await this.simulateNetworkDelay(150);
      const { Product, Category } = databaseManager.getModels();

      const product = await Product.findByPk(id);
      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      if (input.categoryId) {
        const category = await Category.findByPk(input.categoryId);
        if (!category) {
          throw new Error(`Category with ID ${input.categoryId} not found`);
        }
      }

      await product.update(input);
      const updatedProduct = await Product.findByPk(id, {
        include: [{
          model: Category,
          as: 'category'
        }]
      });

      console.log(`✅ Updated product: ${updatedProduct.name}`);
      return this.formatProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await this.simulateNetworkDelay(100);
      const { Product, Category } = databaseManager.getModels();

      const product = await Product.findByPk(id, {
        include: [{
          model: Category,
          as: 'category'
        }]
      });

      if (!product) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const productData = this.formatProduct(product);
      
      await product.destroy();

      console.log(`✅ Deleted product: ${productData.name}`);
      return productData;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateProductStock(productId, stock) {
    try {
      await this.simulateNetworkDelay(100);
      const { Product, Category } = databaseManager.getModels();

      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      await product.update({ stock });
      
      const updatedProduct = await Product.findByPk(productId, {
        include: [{
          model: Category,
          as: 'category'
        }]
      });

      console.log(`✅ Updated stock for ${product.name} to ${stock}`);
      return this.formatProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      await this.simulateNetworkDelay();
      const { Category, Product } = databaseManager.getModels();
      
      const categories = await Category.findAll({
        include: [{
          model: Product,
          as: 'products'
        }],
        order: [['name', 'ASC']]
      });

      return categories.map(category => this.formatCategory(category));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getCategoryById(id) {
    try {
      await this.simulateNetworkDelay(50);
      const { Category, Product } = databaseManager.getModels();
      
      const category = await Category.findByPk(id, {
        include: [{
          model: Product,
          as: 'products',
          include: ['category']
        }]
      });

      if (!category) {
        throw new Error(`Category with ID ${id} not found`);
      }

      return this.formatCategory(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async getStatistics() {
    try {
      await this.simulateNetworkDelay();
      const { Product, Category } = databaseManager.getModels();
      
      const totalProducts = await Product.count();
      const totalCategories = await Category.count();
      const { Op } = require('sequelize');
      const lowStockProducts = await Product.count({
        where: {
          stock: {
            [Op.lt]: 10
          }
        }
      });

      return {
        totalProducts,
        totalCategories,
        lowStockProducts,
        databaseType: this.dbType
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
  }
}

module.exports = new CatalogService();