import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { generateUuid } from '../utils/safeUuid';
import { encodeBase64, decodeBase64 } from '../utils/base64';

// For JWT implementation
let jwtDecode: any;
try {
  // Dynamic import for jwt-decode to avoid errors if package isn't installed yet
  import('jwt-decode').then(module => {
    jwtDecode = module.jwtDecode;
  });
} catch (error) {
  console.warn('jwt-decode not available, using mock implementation');
  // Mock implementation if package isn't installed
  jwtDecode = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeBase64(base64));
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return { exp: 0 };
    }
  };
}

// For this implementation, we'll use a mock API endpoint
// In a real application, you'd replace this with your actual API URL
const API_URL = 'https://api.fraudshield.com'; // Replace with your actual API endpoint

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

interface JwtPayload {
  sub: string; // subject (user ID)
  name: string;
  email: string;
  phone?: string;
  exp: number; // expiration time
}

// Store JWT token
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('jwtToken', token);
  } catch (error) {
    console.error('Error storing JWT token:', error);
  }
};

// Get stored JWT token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('jwtToken');
  } catch (error) {
    console.error('Error getting JWT token:', error);
    return null;
  }
};

// Store user data in AsyncStorage
const storeUserData = async (userData: UserData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

// Get stored user data
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await AsyncStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Create axios instance with JWT token
export const createAuthenticatedAxios = async () => {
  const token = await getToken();
  
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

// For demo purposes, we'll use a mock JWT token generator
// In a real app, this token would come from your backend
const generateMockJwt = (payload: Partial<JwtPayload>): string => {
  // This is just for demo purposes - in a real app, JWT tokens are created server-side
  // with a proper secret key
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowInSeconds = Math.floor(Date.now() / 1000);
  
  const fullPayload = {
    ...payload,
    iat: nowInSeconds,
    exp: nowInSeconds + 3600, // Token expires in 1 hour
  };
  
  // This is a simplified mock! In real JWT, these would be base64-encoded and signed
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodeBase64(JSON.stringify(fullPayload))}.SIGNATURE`;
};

// Email/Password Sign Up with JWT
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  phoneNumber: string
) => {
  try {
    // In a real app, you would make an API call to your authentication endpoint
    // const response = await axios.post(`${API_URL}/auth/signup`, {
    //   email, password, displayName, phoneNumber,
    // });
    
    // For demo purposes, we'll generate a mock token
    const userId = generateUuid();
    const token = generateMockJwt({
      sub: userId,
      name: displayName,
      email: email,
      phone: phoneNumber,
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await storeToken(token);
    
    const userData: UserData = {
      uid: userId,
      email: email,
      displayName: displayName,
      phoneNumber: phoneNumber,
      photoURL: null,
    };
    
    await storeUserData(userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

// Email/Password Sign In with JWT
export const signInWithEmail = async (email: string, password: string) => {
  try {
    // In a real app, you would make an API call to your authentication endpoint
    // const response = await axios.post(`${API_URL}/auth/signin`, {
    //   email, password,
    // });
    
    // For demo purposes, we'll generate a mock token
    const userId = generateUuid();
    const token = generateMockJwt({
      sub: userId,
      name: "Demo User",
      email: email,
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await storeToken(token);
    
    const userData: UserData = {
      uid: userId,
      email: email,
      displayName: "Demo User",
      phoneNumber: null,
      photoURL: null,
    };
    
    await storeUserData(userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

// Mock Google Sign In with JWT
export const signInWithGoogle = async () => {
  try {
    // In a real app, you would make an API call to handle OAuth
    // const response = await axios.post(`${API_URL}/auth/google`, { token: googleToken });
    
    const userId = generateUuid();
    const token = generateMockJwt({
      sub: userId,
      name: 'Google User',
      email: 'google.user@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await storeToken(token);
    
    const userData: UserData = {
      uid: userId,
      email: 'google.user@example.com',
      displayName: 'Google User',
      phoneNumber: null,
      photoURL: null,
    };

    await storeUserData(userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

// Phone Number Sign In with JWT - Step 1: Send OTP
export const sendPhoneOTP = async (phoneNumber: string) => {
  try {
    // In a real app, you would make an API call to send OTP
    // const response = await axios.post(`${API_URL}/auth/phone/request`, { phoneNumber });
    
    // Return a mock confirmation object
    return {
      confirm: async (code: string) => {
        // This would verify the code in a real implementation
        return { success: true };
      }
    };
  } catch (error) {
    throw error;
  }
};

// Phone Number Sign In with JWT - Step 2: Verify OTP
export const verifyPhoneOTP = async (confirmation: any, code: string) => {
  try {
    // In a real app, you would verify the code with the server
    // const response = await axios.post(`${API_URL}/auth/phone/verify`, { code });
    
    const userId = generateUuid();
    const token = generateMockJwt({
      sub: userId,
      name: 'Phone User',
      phone: '+1234567890',
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await storeToken(token);
    
    const userData: UserData = {
      uid: userId,
      email: null,
      displayName: "Phone User",
      phoneNumber: "+1234567890",
      photoURL: null,
    };
    await storeUserData(userData);
    return userData;
  } catch (error) {
    throw error;
  }
};

// Sign Out
export const signOut = async () => {
  try {
    // Remove JWT token and user data
    await AsyncStorage.removeItem('jwtToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) return false;
  
  return !isTokenExpired(token);
};

// Refresh token if needed
export const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const token = await getToken();
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    // In a real app, you would call your refresh token endpoint
    // const response = await axios.post(`${API_URL}/auth/refresh`, { token });
    // await storeToken(response.data.token);
    
    // For demo purposes, just generate a new token
    const userData = await getUserData();
    if (!userData) return false;
    
    const newToken = generateMockJwt({
      sub: userData.uid,
      name: userData.displayName || '',
      email: userData.email || '',
      phone: userData.phoneNumber || undefined,
      exp: Math.floor(Date.now() / 1000) + 3600
    });
    
    await storeToken(newToken);
    return true;
  }
  
  return true;
};

// Protected API call helper
export const callProtectedApi = async (endpoint: string, method = 'GET', data?: any) => {
  await refreshTokenIfNeeded();
  const axiosInstance = await createAuthenticatedAxios();
  
  switch (method.toUpperCase()) {
    case 'GET':
      return axiosInstance.get(endpoint);
    case 'POST':
      return axiosInstance.post(endpoint, data);
    case 'PUT':
      return axiosInstance.put(endpoint, data);
    case 'DELETE':
      return axiosInstance.delete(endpoint);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};
