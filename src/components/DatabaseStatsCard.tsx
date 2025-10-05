import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_DATABASE_STATS } from '../graphql';

interface DatabaseStats {
  totalProducts: number;
  totalCategories: number;
  lowStockProducts: number;
  databaseType: string;
}

interface DatabaseStatsData {
  databaseStats: DatabaseStats;
}

const DatabaseStatsCard: React.FC = () => {
  const { data, loading, error, refetch } = useQuery<DatabaseStatsData>(GET_DATABASE_STATS, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000, 
  });

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Database Stats Error</h3>
        <p className="text-red-600 text-sm">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if data and databaseStats exist before accessing properties
  if (!data || !data.databaseStats) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold mb-2">No Data Available</h3>
        <p className="text-yellow-600 text-sm">Database statistics could not be loaded.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats: DatabaseStats = data.databaseStats;

  const getStockStatusColor = (lowStock: number, total: number) => {
    const percentage = (lowStock / total) * 100;
    if (percentage > 20) return 'text-red-600 bg-red-100';
    if (percentage > 10) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  // const getDatabaseTypeColor = (type: string) => {
  //   switch (type.toLowerCase()) {
  //     case 'postgres':
  //     case 'postgresql':
  //       return 'text-blue-600 bg-blue-100';
  //     case 'dummy':
  //     case 'sqlite':
  //       return 'text-purple-600 bg-purple-100';
  //     default:
  //       return 'text-gray-600 bg-gray-100';
  //   }
  // };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Database Statistics</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh statistics"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {stats.totalProducts.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {stats.totalCategories.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold mb-1 ${getStockStatusColor(stats.lowStockProducts, stats.totalProducts).split(' ')[0]}`}>
            {stats.lowStockProducts.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Low Stock</div>
          {stats.lowStockProducts > 0 && (
            <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getStockStatusColor(stats.lowStockProducts, stats.totalProducts)}`}>
              {((stats.lowStockProducts / stats.totalProducts) * 100).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Healthy Stock */}
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600 mb-1">
            {(stats.totalProducts - stats.lowStockProducts).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Healthy Stock</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Database: {stats.databaseType}</span>
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {stats.lowStockProducts > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              <strong>{stats.lowStockProducts}</strong> product{stats.lowStockProducts > 1 ? 's' : ''} running low on stock
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseStatsCard;