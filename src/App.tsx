import React, { useState } from 'react';
import { ApolloProvider } from '@apollo/client/react';
import { useMutation } from '@apollo/client/react';
import client from './apollo';
import { DELETE_PRODUCT, GET_PRODUCTS } from './graphql';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import DatabaseStatsCard from './components/DatabaseStatsCard';
import './styles.css';

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

const AppContent: React.FC = () => {
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      showMessage('✅ Product deleted successfully!', 'success');
    },
    onError: (error) => {
      showMessage(`❌ Error: ${error.message}`, 'error');
    },
  });

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleEditProduct = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct({ variables: { id: product.id } });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleCloseForm = () => {
    setEditProduct(null);
    setShowForm(false);
  };

  const handleShowAddForm = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                E-Commerce GraphQL Demo
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Microservice Product Catalog Management
              </p>
            </div>
            <button
              onClick={handleShowAddForm}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-4 rounded-md ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <DatabaseStatsCard />
        <ProductList 
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </main>

      {showForm && (
        <ProductForm
          product={editProduct}
          onClose={handleCloseForm}
          onSuccess={(msg) => showMessage(msg, 'success')}
          onError={(msg) => showMessage(msg, 'error')}
        />
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  );
};

export default App;
