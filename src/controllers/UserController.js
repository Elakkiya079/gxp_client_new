// User Controller
// Handles user-related logic and coordinates between views and services

import { UserService } from '../services/UserService.js';

export const UserController = {
  // Get all users
  getAllUsers: async () => {
    try {
      const users = await UserService.fetchUsers();
      return users;
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to fetch users');
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const user = await UserService.fetchUserById(id);
      return user;
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to fetch user');
    }
  },

  // Create new user
  createUser: async (data) => {
    try {
      if (!data.name || !data.email) {
        throw new Error('Name and email are required');
      }
      const user = await UserService.createUser(data);
      return user;
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to create user');
    }
  },

  // Update user
  updateUser: async (id, data) => {
    try {
      if (!data.name || !data.email) {
        throw new Error('Name and email are required');
      }
      const user = await UserService.updateUser(id, data);
      return user;
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to update user');
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      await UserService.deleteUser(id);
    } catch (error) {
      console.error('Controller Error:', error);
      throw new Error('Failed to delete user');
    }
  },
};

