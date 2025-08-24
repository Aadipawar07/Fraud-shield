const { Message, Analysis } = require('../models/Message');
const { DetectionModel } = require('../models/DetectionModel');
const { createAuditLog } = require('../middleware/audit');
const { Op } = require('sequelize');

// Get all messages for a user
exports.getUserMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const messages = await Message.findAndCountAll({
      where: { userId: req.user.id },
      include: [{ model: Analysis }],
      order: [['receivedAt', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      messages: messages.rows,
      totalPages: Math.ceil(messages.count / limit),
      currentPage: page,
      totalMessages: messages.count
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// Get a single message by ID
exports.getMessage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const message = await Message.findOne({
      where: { 
        id,
        userId: req.user.id // Ensure message belongs to user
      },
      include: [{ model: Analysis }]
    });
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ message: 'Server error fetching message' });
  }
};

// Store a new message and analyze it
exports.processMessage = async (req, res) => {
  try {
    const { sender, content, deviceId } = req.body;
    
    // Create new message
    const message = await Message.create({
      sender,
      content,
      deviceId,
      userId: req.user.id,
      receivedAt: new Date()
    });
    
    // Get the active detection model
    const activeModel = await DetectionModel.findOne({
      where: { isActive: true },
      order: [['deployedAt', 'DESC']]
    });
    
    // Analysis logic would go here
    // For demonstration, we'll use a simple check
    const startTime = Date.now();
    
    // Simple check for suspicious phrases
    const suspiciousPatterns = [
      /won.*(\$|prize|money|cash|lottery)/i,
      /verify.*(account|identity|details)/i,
      /click.*(link|here|now)/i,
      /urgent|emergency|limited time/i,
      /(free|discount|offer).*\d+%/i
    ];
    
    let isFraud = false;
    let confidence = 0.0;
    let reason = 'No suspicious patterns detected';
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        isFraud = true;
        confidence = 0.85;
        reason = 'Suspicious language pattern detected';
        break;
      }
    }
    
    // Create analysis result
    const analysis = await Analysis.create({
      messageId: message.id,
      isFraud,
      confidence,
      reason,
      method: activeModel ? activeModel.type : 'rule-based',
      modelVersion: activeModel ? activeModel.version : '1.0.0',
      processingTimeMs: Date.now() - startTime
    });
    
    // Audit the analysis
    await createAuditLog({
      action: 'analyze',
      entity: 'message',
      entityId: message.id,
      description: `Message analyzed: ${isFraud ? 'FRAUD' : 'SAFE'}`,
      changes: { 
        analysis: {
          isFraud,
          confidence,
          reason
        }
      },
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user.id,
      importance: isFraud ? 'high' : 'medium',
      status: 'success'
    });
    
    // Return both message and analysis
    res.status(201).json({
      message,
      analysis
    });
  } catch (error) {
    console.error('Process message error:', error);
    res.status(500).json({ message: 'Server error processing message' });
  }
};

// Search messages
exports.searchMessages = async (req, res) => {
  try {
    const { query, fraud, startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where conditions
    const whereConditions = { userId: req.user.id };
    
    // Add content search if query is provided
    if (query) {
      whereConditions.content = {
        [Op.iLike]: `%${query}%`
      };
    }
    
    // Add date range if provided
    if (startDate || endDate) {
      whereConditions.receivedAt = {};
      if (startDate) {
        whereConditions.receivedAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.receivedAt[Op.lte] = new Date(endDate);
      }
    }
    
    // Search with filter for fraud status if provided
    const messages = await Message.findAndCountAll({
      where: whereConditions,
      include: [{
        model: Analysis,
        ...((fraud === 'true' || fraud === 'false') ? {
          where: {
            isFraud: fraud === 'true'
          }
        } : {})
      }],
      order: [['receivedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      messages: messages.rows,
      totalPages: Math.ceil(messages.count / limit),
      currentPage: parseInt(page),
      totalMessages: messages.count
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error searching messages' });
  }
};

// Get fraud statistics
exports.getMessageStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get total message count
    const totalMessages = await Message.count({
      where: {
        userId: req.user.id,
        receivedAt: { [Op.gte]: startDate }
      }
    });
    
    // Get fraud message count
    const fraudMessages = await Message.count({
      where: {
        userId: req.user.id,
        receivedAt: { [Op.gte]: startDate }
      },
      include: [{
        model: Analysis,
        where: { isFraud: true }
      }]
    });
    
    // Calculate fraud percentage
    const fraudPercentage = totalMessages > 0 
      ? (fraudMessages / totalMessages) * 100 
      : 0;
    
    res.json({
      totalMessages,
      fraudMessages,
      safeMessages: totalMessages - fraudMessages,
      fraudPercentage: parseFloat(fraudPercentage.toFixed(2)),
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};
