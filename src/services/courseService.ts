import axios from 'axios';
import { API_BASE_URL } from './authService';

export interface Course {
  id: number;
  name: string;
  startFrom: string;
  endIn: string;
  dayOfCourse: number;
  instructorId: number;
}

export interface CourseData {
  name: string;
  startFrom: string;
  endIn: string;
  dayOfCourse: number;
  assistantId: number;
}

export interface AddCourseResponse {
  id: number;
  name: string;
  startFrom: string;
  endIn: string;
  dayOfCourse: number;
  instructorId: number;
}

export interface EnrolledStudent {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  enrollmentDate: string;
  status: string;
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

export const addCourse = async (courseData: CourseData): Promise<AddCourseResponse> => {
  try {
    const payload = {
      id: 0,
      name: courseData.name,
      startFrom: courseData.startFrom,
      endIn: courseData.endIn,
      dayOfCourse: courseData.dayOfCourse,
      instructorId: courseData.assistantId
    };

    const response = await api.post('/Instructor/add-course', payload);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to add course. Please check your data.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const getAllCourses = async (assistantId: number): Promise<Course[]> => {
  try {
    const response = await api.get(`/Course/all/${assistantId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch courses.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const deleteCourse = async (courseId: number): Promise<void> => {
  try {
    await api.delete(`/Course/${courseId}`);
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to delete course.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const addAssistantToCourse = async (
  courseId: number,
  assistantData: {
    name: string;
    password: string;
    phoneNumber: string;
  }
) => {
  try {
    const response = await api.post('/Asisstant/add', {
      courseId,
      name: assistantData.name,
      password: assistantData.password,
      phoneNumber: assistantData.phoneNumber
    });
    return response.data;
  } catch (error: any) {
    console.error('Error adding assistant to course:', error);
    throw new Error(error.response?.data?.message || 'Failed to add assistant to course');
  }
};

export const getEnrolledStudents = async (courseId: number): Promise<EnrolledStudent[]> => {
  try {
    const response = await api.get(`/Course/${courseId}/students`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching enrolled students:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch enrolled students');
  }
}; 