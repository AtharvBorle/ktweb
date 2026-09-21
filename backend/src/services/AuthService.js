const jwt = require('jsonwebtoken');
const dataRepo = require('../repositories/DataRepository');
const config = require('../config/config');
const { UnauthorizedError, BadRequestError } = require('../utils/helpers');

/**
 * Enterprise Authentication Service
 * Handles admin authentication, password verification, and session/JWT tokens
 */
class AuthService {
  async login(username, password) {
    if (!username || !password) {
      throw new BadRequestError('Username and password are required.');
    }

    const admin = dataRepo.authenticateAdmin(username.trim(), password);
    if (!admin) {
      throw new UnauthorizedError('Invalid username or password.');
    }

    // Generate JWT token for stateless/API auth
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return { admin, token };
  }

  async getProfile(adminId) {
    const admin = dataRepo.getAdminById(adminId);
    if (!admin) {
      throw new UnauthorizedError('Admin user not found.');
    }
    return admin;
  }

  async changePassword(adminId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestError('Current password and new password are both required.');
    }
    try {
      dataRepo.changeAdminPassword(adminId, currentPassword, newPassword);
      return { success: true, message: 'Password changed successfully.' };
    } catch (err) {
      throw new BadRequestError(err.message);
    }
  }

  async getSecurityStatus(adminId) {
    const isDefault = dataRepo.isDefaultPasswordActive(adminId);
    return {
      isDefaultPassword: isDefault,
      recommendation: isDefault
        ? 'Security Notice: You are currently using the default administrator password (admin123). Please change your password.'
        : 'Password is secure.'
    };
  }
}

module.exports = new AuthService();
