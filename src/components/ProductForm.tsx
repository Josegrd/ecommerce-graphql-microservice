import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_PRODUCT, UPDATE_PRODUCT, GET_PRODUCTS, GET_CATEGORIES } from '../graphql';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category.id || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: ''
      });
    }
    setErrors({});
  }, [product]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Valid price greater than 0 is required';
    }

    if (!formData.stock || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Valid stock (0 or more) is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const input = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId
      };

      if (product) {
        // Update existing product
        await updateProduct({
          variables: {
            id: product.id,
            input
          }
        });
        onSuccess(`✅ Product "${input.name}" updated successfully!`);
      } else {
        // Create new product
        await createProduct({
          variables: { input }
        });
        onSuccess(`✅ Product "${input.name}" created successfully!`);
      }

      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
      onError(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product description (optional)"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (IDR) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={isSubmitting}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                disabled={isSubmitting}
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select a category</option>
                {categoriesData?.categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {product ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  product ? 'Update Product' : 'Create Product'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;