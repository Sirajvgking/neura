import { User } from '../types';

const STORAGE_KEY = 'neura_user_session';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    // Mock successful login
    const user: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0], // Derive name from email for demo
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }

    const user: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};