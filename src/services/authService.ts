import axios from 'axios';

export const API_BASE_URL = 'https://bigbrotherv01.runasp.net/api';

interface LoginResponse {
  // Define the expected response structure based on your API
  token?: string;
  accessToken?: string; // Some APIs use different token field names
  authToken?: string;
  user?: any;
  email?: string;
  instructorId?: number;
  assistantid?: number; // The actual field returned by the API
  asisstantId?: number; // The field with typo that your API actually uses
  assistantId?: number; // Standard field name
  id?: number; // Some APIs return 'id' instead of 'instructorId'
  userId?: number; // Another possible field name
  role?: string;
  displayName?: string;
  phoneNumber?: number;
  expiration?: string;
  courses?: Array<{
    courseId: number;
    courseName: string;
  }>;
  // Add other fields as needed
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'accept': '*/*'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const loginInstructor = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/Accounts/login-instractour', {
      email,
      password
    });

    const data = response.data;
    console.log('=== LOGIN DEBUG INFO ===');
    console.log('Full API Response:', data);
    console.log('Response Type:', typeof data);
    console.log('Available Properties:', Object.keys(data || {}));
    
    if (data) {
      Object.keys(data).forEach(key => {
        console.log(`${key}: ${data[key]} (type: ${typeof data[key]})`);
      });
    }

    // Extract token with more flexibility
    const token = data?.token || data?.accessToken || data?.authToken || data?.access_token || data?.bearer;
    console.log('Extracted token:', token ? 'Found' : 'Not found');

    if (!token) {
      console.warn('No token found in response. Available fields:', Object.keys(data || {}));
      // Don't fail immediately - some APIs might not require tokens for login
    }

    // Store token if available
    if (token) {
      localStorage.setItem('authToken', token);
    }

    // Extract instructor ID with maximum flexibility
    const possibleIdFields = [
      'asisstantId', // API uses this field with typo - check first
      'assistantid', 'assistantId', 'AssistantId', 'assistant_id',
      'instructorId', 'InstructorId', 'instructor_id',
      'id', 'Id', 'ID',
      'userId', 'UserId', 'user_id',
      'employeeId', 'EmployeeId', 'employee_id',
      'teacherId', 'TeacherId', 'teacher_id'
    ];

    let instructorId = null;
    for (const field of possibleIdFields) {
      if (data?.[field] !== undefined && data?.[field] !== null && !isNaN(Number(data[field]))) {
        instructorId = Number(data[field]);
        console.log(`Found instructor ID in field '${field}': ${instructorId}`);
        break;
      }
    }

    // If no ID found, try nested objects
    if (instructorId === null && data?.user) {
      console.log('Checking user object:', data.user);
      for (const field of possibleIdFields) {
        if (data.user[field] !== undefined && data.user[field] !== null && !isNaN(Number(data.user[field]))) {
          instructorId = Number(data.user[field]);
          console.log(`Found instructor ID in user.${field}: ${instructorId}`);
          break;
        }
      }
    }

    console.log('Final instructor ID:', instructorId);

    // Return the result with the actual ID or null - let the calling code handle missing IDs
    if (instructorId === null) {
      console.warn('No instructor ID found in any expected field.');
      console.warn('Available fields in response:', Object.keys(data || {}));
      console.warn('This will likely cause issues with course management.');
    }

    const result = {
      ...data,
      email,
      instructorId, // This will be null if not found
      authToken: token
    };

    console.log('=== LOGIN RESULT ===');
    console.log('Email:', result.email);
    console.log('Instructor ID:', result.instructorId);
    console.log('Has Token:', !!result.authToken);
    console.log('========================');

    return result;
  } catch (error: any) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.response.status === 404) {
        throw new Error('Login endpoint not found. Please contact support.');
      } else if (error.response.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(error.response.data?.message || `Login failed with status ${error.response.status}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    throw new Error(error.message || 'An unexpected error occurred during login.');
  }
};

export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
}; 