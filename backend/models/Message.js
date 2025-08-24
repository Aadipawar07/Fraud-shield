const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');

// SMS Message Model
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  receivedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Optional user association if the message belongs to a registered user
  userId: {
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
    { fields: ['sender'] },
    { fields: ['receivedAt'] },
    { fields: ['userId'] }
  ]
});

// Analysis Result Model
const Analysis = sequelize.define('Analysis', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    references: {
      model: Message,
      key: 'id'
    },
    allowNull: false
  },
  isFraud: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    validate: {
      min: 0,
      max: 1
    }
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processingTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  modelVersion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['messageId'] },
    { fields: ['isFraud'] }
  ]
});

// Define relationships
Message.hasOne(Analysis, { foreignKey: 'messageId' });
Analysis.belongsTo(Message, { foreignKey: 'messageId' });

User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  Message,
  Analysis
};
