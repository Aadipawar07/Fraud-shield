const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../middleware/audit');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    }, 
    process.env.JWT_SECRET, 
    { 
      expiresIn: process.env.JWT_EXPIRES_IN 
    }
  );
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, displayName, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      displayName,
      phoneNumber
    });

    // Generate JWT token
    const token = generateToken(user);

    // Create audit log
    await createAuditLog({
      action: 'register',
      entity: 'user',
      entityId: user.id,
      description: `User registered: ${email}`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: user.id,
      importance: 'medium'
    });

    // Return user data without password
    const userData = {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role: user.role,
      isVerified: user.isVerified
    };

    res.status(201).json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts',
        lockedUntil: user.lockUntil
      });
    }

    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts and update last login
    await user.update({
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date()
    });

    // Generate token
    const token = generateToken(user);

    // Create audit log
    await createAuditLog({
      action: 'login',
      entity: 'user',
      entityId: user.id,
      description: `User logged in: ${email}`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: user.id,
      importance: 'low'
    });

    // Return user data without password
    const userData = {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role: user.role,
      isVerified: user.isVerified
    };

    res.json({
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    // User is already attached to request from auth middleware
    const user = req.user;

    // Return user data without password
    const userData = {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, phoneNumber, photoURL } = req.body;
    const user = req.user;

    // Track changes for audit log
    const changes = {};
    if (displayName !== undefined && displayName !== user.displayName) changes.displayName = { old: user.displayName, new: displayName };
    if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) changes.phoneNumber = { old: user.phoneNumber, new: phoneNumber };
    if (photoURL !== undefined && photoURL !== user.photoURL) changes.photoURL = { old: user.photoURL, new: photoURL };

    // Update user
    await user.update({ displayName, phoneNumber, photoURL });

    // Create audit log if there were changes
    if (Object.keys(changes).length > 0) {
      await createAuditLog({
        action: 'update',
        entity: 'user',
        entityId: user.id,
        description: `User profile updated`,
        changes,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: user.id,
        importance: 'low'
      });
    }

    // Return updated profile
    const userData = {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      role: user.role,
      isVerified: user.isVerified
    };

    res.json(userData);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    await user.update({ password: newPassword });

    // Create audit log
    await createAuditLog({
      action: 'change_password',
      entity: 'user',
      entityId: user.id,
      description: `User password changed`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: user.id,
      importance: 'high'
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// Log out
exports.logout = async (req, res) => {
  try {
    // JWT is stateless, so we don't actually invalidate the token here
    // A proper implementation would use a token blacklist or Redis store
    // For now, we just log the logout event
    
    if (req.user) {
      await createAuditLog({
        action: 'logout',
        entity: 'user',
        entityId: req.user.id,
        description: `User logged out`,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user.id,
        importance: 'low'
      });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
