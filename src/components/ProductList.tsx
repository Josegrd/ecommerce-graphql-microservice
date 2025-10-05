import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS, SEARCH_PRODUCTS, GET_CATEGORIES, GET_PRODUCTS_BY_CATEGORY } from '../graphql';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface ProductListProps {
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onEditProduct, onDeleteProduct }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS, {
    skip: isSearching || selectedCategory !== '',
  });
  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_PRODUCTS, {
    variables: { keyword: searchKeyword },
    skip: !isSearching || !searchKeyword.trim(),
  });
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const { data: categoryProductsData, loading: categoryLoading } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { categoryId: selectedCategory },
    skip: !selectedCategory,
  });
  const getDisplayData = () => {
    if (selectedCategory && categoryProductsData) {
      return { products: categoryProductsData.productsByCategory, loading: categoryLoading };
    }
    if (isSearching && searchData) {
      return { products: searchData.searchProducts, loading: searchLoading };
    }
    return { products: productsData?.products || [], loading: productsLoading };
  };

  const { products, loading } = getDisplayData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      setIsSearching(true);
      setSelectedCategory('');
    }
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setIsSearching(false);
    setSelectedCategory('');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsSearching(false);
    setSearchKeyword('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (productsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error loading products</h3>
        <p className="text-red-600">{productsError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
            {products.length} products
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!searchKeyword.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </div>
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categoriesData?.categories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {(isSearching || selectedCategory) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>

        {(isSearching || selectedCategory) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {isSearching && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Search: "{searchKeyword}"
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                Category: {categoriesData?.categories.find((c: Category) => c.id === selectedCategory)?.name}
              </span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {isSearching 
                  ? `No products match "${searchKeyword}"` 
                  : selectedCategory 
                    ? "No products in this category"
                    : "No products available"}
              </p>
            </div>
          ) : (
            products.map((product: Product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : product.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      Stock: {product.stock}
                    </span>
                  </div>

                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {product.category.name}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p>Created: {formatDate(product.createdAt)}</p>
                    {product.updatedAt !== product.createdAt && (
                      <p>Updated: {formatDate(product.updatedAt)}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditProduct(product)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteProduct(product)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;