import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserData, getUserData, isAuthenticated, signOut, signInWithEmail, signUpWithEmail } from '../services/auth';

// Define the context types
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, phoneNumber: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load user data on startup
  useEffect(() => {
    loadUserData();
  }, []);

  // Function to load user data from storage
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const isUserAuthenticated = await isAuthenticated();
      setIsLoggedIn(isUserAuthenticated);
      
      if (isUserAuthenticated) {
        const userData = await getUserData();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to login user
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with:', email);
      const userData = await signInWithEmail(email, password);
      console.log('Sign in successful:', userData);
      await loadUserData(); // Refresh user data after login
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Function to register user
  const register = async (email: string, password: string, displayName: string, phoneNumber: string) => {
    try {
      console.log('Registering new user:', email, displayName);
      const userData = await signUpWithEmail(email, password, displayName, phoneNumber);
      console.log('Registration successful:', userData);
      await loadUserData(); // Refresh user data after registration
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  };

  // Function to logout user
  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn,
        login,
        register,
        logout,
        refreshUser: loadUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
