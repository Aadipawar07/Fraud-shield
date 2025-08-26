import { AuditLog } from '../models/AuditLog.js';

/**
 * Middleware to log all API requests
 */
export const requestLogger = (req, res, next) => {
  // Capture original end method
  const originalEnd = res.end;
  
  // Record start time
  const startTime = Date.now();
  
  // Override res.end method
  res.end = function(...args) {
    // Calculate request duration
    const duration = Date.now() - startTime;
    
    // Log request details
    console.log({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Call original end method
    originalEnd.apply(res, args);
  };
  
  next();
};

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 */
export const createAuditLog = async (options) => {
  try {
    const { 
      action, 
      entity, 
      entityId = null, 
      description = null, 
      changes = null,
      ip = null,
      userAgent = null,
      userId = null,
      status = 'success',
      importance = 'low'
    } = options;
    
    await AuditLog.create({
      action,
      entity,
      entityId,
      description,
      changes,
      ip,
      userAgent,
      userId,
      status,
      importance,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

/**
 * Middleware to create an audit log entry for user actions
 */
exports.auditAction = (action, entity, importance = 'medium') => {
  return async (req, res, next) => {
    // Store original send method
    const originalSend = res.send;
    
    // Override send method
    res.send = function(...args) {
      const body = args[0];
      const statusCode = res.statusCode;
      
      // Determine status based on HTTP status code
      let status = 'success';
      if (statusCode >= 400) status = 'failure';
      else if (statusCode >= 300) status = 'warning';
      
      // Get entity ID from request params, body or response
      let entityId = req.params.id || (req.body && req.body.id) || null;
      
      // Try to extract entity ID from response if it's an object
      if (!entityId && typeof body === 'object' && body !== null && body.id) {
        entityId = body.id;
      }
      
      // Create audit log entry
      createAuditLog({
        action,
        entity,
        entityId,
        description: `${action} ${entity}${entityId ? ' ' + entityId : ''}`,
        changes: req.method !== 'GET' ? req.body : null,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user ? req.user.id : null,
        status,
        importance
      });
      
      // Call original send method
      return originalSend.apply(res, args);
    };
    
    next();
  };
};
