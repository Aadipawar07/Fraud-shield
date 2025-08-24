const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');

// Detection Model Configuration
const DetectionModel = sequelize.define('DetectionModel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('rule-based', 'ml-model', 'hybrid'),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  configuration: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  parameters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  trainedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deployedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['name', 'version'], unique: true },
    { fields: ['isActive'] }
  ]
});

// Model Performance Metrics over time
const ModelMetric = sequelize.define('ModelMetric', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  modelId: {
    type: DataTypes.UUID,
    references: {
      model: DetectionModel,
      key: 'id'
    },
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  accuracy: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 1
    }
  },
  precision: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 1
    }
  },
  recall: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 1
    }
  },
  f1Score: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 1
    }
  },
  falsePositives: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  falseNegatives: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  truePositives: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trueNegatives: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  additionalMetrics: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['modelId'] },
    { fields: ['date'] }
  ]
});

// Define relationships
DetectionModel.hasMany(ModelMetric, { foreignKey: 'modelId' });
ModelMetric.belongsTo(DetectionModel, { foreignKey: 'modelId' });

User.hasMany(DetectionModel, { foreignKey: 'createdBy' });
DetectionModel.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = {
  DetectionModel,
  ModelMetric
};
