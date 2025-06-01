import axios from 'axios';
import { API_BASE_URL } from './authService';

export interface Student {
  id: number;
  name: string;
  image: string | null;
  attendedClasses: number;
  absences: number;
  excusedAbsences: number;
  totalClasses: number;
}

export interface NewStudent {
  nationalId: string;
  name: string;
  department?: string;
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

export const getStudentsByCourse = async (courseId: number): Promise<Student[]> => {
  try {
    const response = await api.get<any>(`/Student/by-course/${courseId}`);
    const raw = response.data;
    if (Array.isArray(raw)) {
      return raw;
    }
    if (raw?.items) {
      return raw.items;
    }
    if (raw?.value?.items) {
      return raw.value.items;
    }
    if (raw?.value) {
      return raw.value;
    }
    return [];
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch students.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred.');
  }
};

export const addStudentToCourse = async (courseId: number, student: NewStudent): Promise<void> => {
  try {
    await api.post(`/Student/add?courseid=${courseId}`, student);
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to add student.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred.');
  }
};

export const uploadStudentsFile = async (courseId: number, file: File): Promise<void> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    await api.post(`/Student/upload?courseid=${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to upload students file.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred.');
  }
}; 