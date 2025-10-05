const axios = require('axios');

class CatalogServiceClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 5000,
    });
  }

  async getHealth() {
    try {
      const response = await this.client.get('/health');
      return {
        status: response.data.status,
        service: 'Catalog Service',
        uptime: response.data.uptime
      };
    } catch (error) {
      return {
        status: 'ERROR',
        service: 'Catalog Service',
        error: error.message
      };
    }
  }

  async getAllProducts() {
    const response = await this.client.get('/api/products');
    return response.data.data;
  }

  async getProductById(id) {
    const response = await this.client.get(`/api/products/${id}`);
    return response.data.data;
  }

  async getProductsByCategory(categoryId) {
    const response = await this.client.get(`/api/categories/${categoryId}/products`);
    return response.data.data;
  }

  async searchProducts(keyword) {
    const response = await this.client.get(`/api/products/search?keyword=${encodeURIComponent(keyword)}`);
    return response.data.data;
  }

  async createProduct(input) {
    const response = await this.client.post('/api/products', input);
    return response.data.data;
  }

  async updateProduct(id, input) {
    const response = await this.client.put(`/api/products/${id}`, input);
    return response.data.data;
  }

  async deleteProduct(id) {
    const response = await this.client.delete(`/api/products/${id}`);
    return response.data.data;
  }

  async updateProductStock(productId, stock) {
    const response = await this.client.patch(`/api/products/${productId}/stock`, { stock });
    return response.data.data;
  }

  async getAllCategories() {
    const response = await this.client.get('/api/categories');
    return response.data.data;
  }

  async getCategoryById(id) {
    const response = await this.client.get(`/api/categories/${id}`);
    return response.data.data;
  }

  async getStatistics() {
    const response = await this.client.get('/stats');
    return response.data;
  }
}

async function setupServiceClients() {
  // Read from environment variables in a real implementation
  const catalogServiceUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3001';

  const catalogService = new CatalogServiceClient(catalogServiceUrl);

  return {
    catalogService,
    getHealthStatus: async () => {
      const catalogHealth = await catalogService.getHealth();
      return [catalogHealth];
    }
  };
}

module.exports = { setupServiceClients };