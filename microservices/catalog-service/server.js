const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let products = [
  {
    id: "cat-1",
    name: "iPhone 14 Pro",
    description: "Latest Apple smartphone with A16 Bionic chip",
    price: 999.99,
    stock: 50,
    categoryId: "cat-smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cat-2",
    name: "Samsung Galaxy S23",
    description: "Premium Android smartphone with advanced camera",
    price: 899.99,
    stock: 30,
    categoryId: "cat-smartphones",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cat-3",
    name: "MacBook Pro M2",
    description: "Professional laptop with M2 chip",
    price: 1299.99,
    stock: 20,
    categoryId: "cat-laptops",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cat-4",
    name: "iPad Air",
    description: "Powerful tablet with M1 chip",
    price: 599.99,
    stock: 25,
    categoryId: "cat-tablets",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cat-5",
    name: "AirPods Pro 2",
    description: "Wireless earbuds with active noise cancellation",
    price: 249.99,
    stock: 100,
    categoryId: "cat-audio",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let categories = [
  {
    id: "cat-smartphones",
    name: "Smartphones",
    description: "Mobile phones and accessories"
  },
  {
    id: "cat-laptops", 
    name: "Laptops",
    description: "Portable computers"
  },
  {
    id: "cat-tablets",
    name: "Tablets",
    description: "Tablet computers and accessories"
  },
  {
    id: "cat-audio",
    name: "Audio",
    description: "Headphones, speakers, and audio devices"
  }
];

// Get all products
app.get('/api/products', (req, res) => {
  const { category, search, limit, offset } = req.query;
  
  let filteredProducts = [...products];
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.categoryId === category);
  }
  
  // Search functionality
  if (search) {
    const searchTerm = search.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }
  
  // Pagination
  const startIndex = parseInt(offset) || 0;
  const limitNum = parseInt(limit) || filteredProducts.length;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limitNum);
  
  res.json({
    success: true,
    data: paginatedProducts,
    total: filteredProducts.length,
    count: paginatedProducts.length,
    pagination: {
      offset: startIndex,
      limit: limitNum,
      hasMore: startIndex + limitNum < filteredProducts.length
    }
  });
});

// Search products
app.get('/api/products/search', (req, res) => {
  const { keyword } = req.query;
  
  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: 'Search keyword is required'
    });
  }
  
  const searchTerm = keyword.toLowerCase();
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    success: true,
    data: filteredProducts,
    count: filteredProducts.length,
    keyword
  });
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  
  // Validation
  if (!name || !price || stock === undefined || !categoryId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: name, price, stock, categoryId'
    });
  }
  
  // Check if category exists
  const categoryExists = categories.find(c => c.id === categoryId);
  if (!categoryExists) {
    return res.status(400).json({
      success: false,
      message: 'Invalid categoryId'
    });
  }
  
  const newProduct = {
    id: `cat-${Date.now()}`,
    name,
    description: description || '',
    price: parseFloat(price),
    stock: parseInt(stock),
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    data: newProduct,
    message: 'Product created successfully'
  });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  const { name, description, price, stock, categoryId } = req.body;
  
  // Update fields if provided
  if (name !== undefined) products[productIndex].name = name;
  if (description !== undefined) products[productIndex].description = description;
  if (price !== undefined) products[productIndex].price = parseFloat(price);
  if (stock !== undefined) products[productIndex].stock = parseInt(stock);
  if (categoryId !== undefined) {
    // Validate category exists
    const categoryExists = categories.find(c => c.id === categoryId);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid categoryId'
      });
    }
    products[productIndex].categoryId = categoryId;
  }
  
  products[productIndex].updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: products[productIndex],
    message: 'Product updated successfully'
  });
});

// Delete product
// Delete product
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  const deletedProduct = products[index];
  products.splice(index, 1);
  
  res.json({
    success: true,
    data: deletedProduct,
    message: 'Product deleted successfully'
  });
});

// Update product stock
app.patch('/api/products/:id/stock', (req, res) => {
  const { stock } = req.body;
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }
  
  if (stock === undefined || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid stock value is required'
    });
  }
  
  product.stock = parseInt(stock);
  product.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: product,
    message: 'Product stock updated successfully'
  });
});

// =====================================
// CATEGORY ENDPOINTS
// =====================================

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: categories,
    count: categories.length
  });
});

// Get category by ID
app.get('/api/categories/:id', (req, res) => {
  const category = categories.find(c => c.id === req.params.id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.json({
    success: true,
    data: category
  });
});

// Get products by category
app.get('/api/categories/:id/products', (req, res) => {
  const categoryId = req.params.id;
  const categoryExists = categories.find(c => c.id === categoryId);
  
  if (!categoryExists) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  const categoryProducts = products.filter(p => p.categoryId === categoryId);
  
  res.json({
    success: true,
    data: categoryProducts,
    count: categoryProducts.length,
    category: categoryExists
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'catalog-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    port: PORT,
    endpoints: {
      products: `/api/products`,
      categories: `/api/categories`
    }
  });
});

// Database statistics endpoint
app.get('/stats', (req, res) => {
  res.json({
    totalProducts: products.length,
    totalCategories: categories.length,
    lowStockProducts: products.filter(p => p.stock < 10).length,
    databaseType: process.env.DB_TYPE || 'dummy'
  });
});

// Service info
app.get('/info', (req, res) => {
  res.json({
    service: 'catalog-service',
    description: 'Microservice for managing product catalog',
    version: '1.0.0',
    endpoints: [
      'GET /api/products - Get all products',
      'GET /api/products/:id - Get product by ID',
      'POST /api/products - Create new product',
      'PUT /api/products/:id - Update product',
      'DELETE /api/products/:id - Delete product',
      'GET /api/categories - Get all categories',
      'GET /api/categories/:id - Get category by ID',
      'GET /stats - Get database statistics'
    ],
    statistics: {
      totalProducts: products.length,
      totalCategories: categories.length,
      lowStockProducts: products.filter(p => p.stock < 10).length
    }
  });
});

// =====================================
// ERROR HANDLING
// =====================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    service: 'catalog-service'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    service: 'catalog-service'
  });
});

app.listen(PORT, () => {
  console.log(`  Catalog Microservice running on port ${PORT}`);
  console.log(`  Service Info: http://localhost:${PORT}/info`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`  Products API: http://localhost:${PORT}/api/products`);
  console.log(`  Categories API: http://localhost:${PORT}/api/categories`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Catalog service shutting down gracefully...');
  process.exit(0);
});

module.exports = app;