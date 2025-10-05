// DATABASE CONFIGURATION & CONNECTION
const { Sequelize } = require('sequelize');
const { CategoryModel, ProductModel, defineAssociations } = require('./models');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    this.sequelize = null;
    this.models = {};
    this.isConnected = false;
    this.dbType = process.env.DB_TYPE || 'dummy';
  }

  async initialize() {
    try {
      if (this.dbType === 'postgres') {
        await this.initializePostgreSQL();
      } else {
        await this.initializeDummy();
      }
      
      console.log(`📦 Database initialized: ${this.dbType.toUpperCase()}`);
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  async initializePostgreSQL() {
    this.sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'ecommerce_db',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    await this.sequelize.authenticate();
    this.models.Category = CategoryModel(this.sequelize);
    this.models.Product = ProductModel(this.sequelize);
    defineAssociations(this.models);
    await this.sequelize.sync({ force: false });
    this.isConnected = true;
  }

  async initializeDummy() {
    this.sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
    });

    this.models.Category = CategoryModel(this.sequelize);
    this.models.Product = ProductModel(this.sequelize);
    defineAssociations(this.models);
    await this.sequelize.sync({ force: true });
    await this.seedDummyData();
    this.isConnected = true;
  }

  async seedDummyData() {
    const { Category, Product } = this.models;
    const categories = await Category.bulkCreate([
      {
        id: '1',
        name: 'Smartphones',
        description: 'Mobile phones and accessories'
      },
      {
        id: '2',
        name: 'Laptops',
        description: 'Portable computers and notebooks'
      },
      {
        id: '3',
        name: 'Accessories',
        description: 'Tech accessories and gadgets'
      },
      {
        id: '4',
        name: 'Audio',
        description: 'Headphones, speakers, and audio devices'
      },
      {
        id: '5',
        name: 'Gaming',
        description: 'Gaming consoles and accessories'
      }
    ]);

    const products = await Product.bulkCreate([
      {
        id: '1',
        name: 'iPhone 14 Pro',
        description: 'Latest Apple smartphone with A16 Bionic chip, 6.1-inch Super Retina XDR display',
        price: 999.99,
        stock: 50,
        categoryId: '1'
      },
      {
        id: '2',
        name: 'Samsung Galaxy S23',
        description: 'Premium Android smartphone with advanced camera system and 120Hz display',
        price: 899.99,
        stock: 30,
        categoryId: '1'
      },
      {
        id: '3',
        name: 'Google Pixel 7 Pro',
        description: 'Google flagship with advanced AI photography and pure Android experience',
        price: 799.99,
        stock: 25,
        categoryId: '1'
      },
      {
        id: '4',
        name: 'MacBook Pro M2',
        description: 'Professional laptop with M2 chip, 13-inch Retina display, 8GB RAM, 256GB SSD',
        price: 1299.99,
        stock: 20,
        categoryId: '2'
      },
      {
        id: '5',
        name: 'Dell XPS 13',
        description: 'Ultra-thin laptop with Intel i7, 16GB RAM, 512GB SSD, 13.3-inch 4K display',
        price: 1199.99,
        stock: 15,
        categoryId: '2'
      },
      {
        id: '6',
        name: 'Lenovo ThinkPad X1',
        description: 'Business laptop with Intel i7, 16GB RAM, 1TB SSD, 14-inch display',
        price: 1399.99,
        stock: 10,
        categoryId: '2'
      },
      {
        id: '7',
        name: 'AirPods Pro 2',
        description: 'Wireless earbuds with active noise cancellation and spatial audio',
        price: 249.99,
        stock: 100,
        categoryId: '4'
      },
      {
        id: '8',
        name: 'Sony WH-1000XM5',
        description: 'Premium wireless headphones with industry-leading noise cancellation',
        price: 399.99,
        stock: 40,
        categoryId: '4'
      },
      {
        id: '9',
        name: 'Magic Mouse',
        description: 'Apple wireless mouse with multi-touch surface and rechargeable battery',
        price: 79.99,
        stock: 75,
        categoryId: '3'
      },
      {
        id: '10',
        name: 'Logitech MX Master 3',
        description: 'Advanced wireless mouse for productivity with hyper-fast scrolling',
        price: 99.99,
        stock: 60,
        categoryId: '3'
      },
      {
        id: '11',
        name: 'PlayStation 5',
        description: 'Next-generation gaming console with 4K gaming and ray tracing',
        price: 499.99,
        stock: 5,
        categoryId: '5'
      },
      {
        id: '12',
        name: 'Xbox Series X',
        description: 'Microsoft gaming console with 4K gaming and backwards compatibility',
        price: 499.99,
        stock: 8,
        categoryId: '5'
      },
      {
        id: '13',
        name: 'Nintendo Switch OLED',
        description: 'Hybrid gaming console with 7-inch OLED screen for handheld and TV gaming',
        price: 349.99,
        stock: 20,
        categoryId: '5'
      }
    ]);

    console.log(`✅ Seeded ${categories.length} categories and ${products.length} products`);
  }

  getModels() {
    if (!this.isConnected) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.models;
  }

  async getDatabaseInfo() {
    return {
      type: this.dbType,
      isConnected: this.isConnected,
      health: {
        status: this.isConnected ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = new DatabaseManager();