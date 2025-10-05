const { DataTypes } = require('sequelize');

const CategoryModel = (sequelize) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  return Category;
};

const ProductModel = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
        isDecimal: true
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    tableName: 'products',
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId']
      },
      {
        fields: ['name']
      },
      {
        fields: ['price']
      }
    ]
  });

  return Product;
};

const defineAssociations = (models) => {
  const { Category, Product } = models;

  Category.hasMany(Product, {
    foreignKey: 'categoryId',
    as: 'products'
  });

  Product.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category'
  });
};

module.exports = {
  CategoryModel,
  ProductModel,
  defineAssociations
};