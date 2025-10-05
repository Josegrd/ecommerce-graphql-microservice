const catalogService = require('../services/catalog-service');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await catalogService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await catalogService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: `Product with ID ${req.params.id} not found` });
    }
    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await catalogService.getProductsByCategory(req.params.id);
    res.json(products);
  } catch (error) {
    console.error('Error in getProductsByCategory:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword || keyword.trim().length === 0) {
      return res.status(400).json({ error: 'Search keyword cannot be empty' });
    }
    
    const products = await catalogService.searchProducts(keyword);
    res.json(products);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (price <= 0) {
      return res.status(400).json({ error: 'Product price must be greater than 0' });
    }
    if (stock < 0) {
      return res.status(400).json({ error: 'Product stock cannot be negative' });
    }
    
    const product = await catalogService.createProduct({
      name, description, price, stock, categoryId
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId } = req.body;
    
    if (price !== undefined && price <= 0) {
      return res.status(400).json({ error: 'Product price must be greater than 0' });
    }
    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'Product stock cannot be negative' });
    }
    
    const updatedProduct = await catalogService.updateProduct(id, {
      name, description, price, stock, categoryId
    });
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await catalogService.deleteProduct(req.params.id);
    res.json(deletedProduct);
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock < 0) {
      return res.status(400).json({ error: 'Product stock cannot be negative' });
    }
    
    const updatedProduct = await catalogService.updateProductStock(id, stock);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await catalogService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await catalogService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: `Category with ID ${req.params.id} not found` });
    }
    res.json(category);
  } catch (error) {
    console.error('Error in getCategoryById:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await catalogService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ error: error.message });
  }
};