// User Service
// Handles all user-related API calls and business logic

export const UserService = {
  // Fetch all users
  fetchUsers: async () => {
    try {
      // Mock data for demonstration
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Admin',
          createdAt: new Date('2024-01-15'),
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'User',
          createdAt: new Date('2024-01-20'),
        },
      ];
      return mockUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Fetch a single user by ID
  fetchUserById: async (id) => {
    try {
      const users = await UserService.fetchUsers();
      return users.find((user) => user.id === id) || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (data) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date(),
      };
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (id, data) => {
    try {
      const user = {
        id,
        ...data,
        createdAt: new Date(),
      };
      return user;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (_id) => {
    try {
      // Delete logic
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Login user with email and password
  // DUMMY RESPONSE - Replace with actual API endpoint when ready
  login: async (email, _password) => {
    try {
      const dummyResponse = {
        approved: true,
        user: {
          id: '123',
          email,
          name: 'Test User',
        },
        token: `dummy_jwt_token_${Date.now()}`,
      };
      return dummyResponse;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
};

