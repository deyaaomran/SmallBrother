import axios from 'axios';
import { API_BASE_URL } from './authService';

export interface AttendanceRecord {
  date: string;
  time: string | null;
  studentName: string;
  studentId: number;
  courseId: number;
  asisstantId: number;
}

interface AttendanceResponse {
  result: any;
  value: {
    items: AttendanceRecord[];
    totalRecords: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface PaginatedAttendanceResponse {
  items: AttendanceRecord[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
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

export const getCourseAttendance = async (
  courseId: number,
  PageNumber: number = 1,
  PageSize: number = 10,
  searchTerm: string = ''
): Promise<PaginatedAttendanceResponse> => {
  try {
    console.log('Fetching attendance with params:', { courseId, PageNumber, PageSize, searchTerm });
    
    const response = await api.get<AttendanceResponse>('/Attendance/for-course', {
      params: {
        courseId,
        PageNumber,
        PageSize,
        searchTerm: searchTerm || undefined
      }
    });

    console.log('API Response:', response.data);
    console.log('Response value:', response.data?.value);

    const data = response.data?.value;
    
    if (!data) {
      throw new Error('Invalid response structure from API');
    }
    
    return {
      items: data.items || [],
      totalCount: data.totalRecords || 0,
      pageSize: data.pageSize || PageSize,
      currentPage: data.pageNumber || PageNumber,
      totalPages: data.totalPages || 1,
      hasNext: data.hasNextPage || false,
      hasPrevious: data.hasPreviousPage || false
    };
  } catch (error: any) {
    console.error('Error fetching attendance:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to fetch attendance data.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const markAttendance = async (
  courseId: number,
  studentId: number,
  date: string,
  time: string
): Promise<void> => {
  try {
    await api.post('/Attendance/mark', {
      courseId,
      studentId,
      date,
      time
    });
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Failed to mark attendance.');
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

export const downloadCourseAttendanceFromData = (
  attendance: AttendanceRecord[],
  courseId: number,
  courseName: string
): void => {
  try {
    // Create CSV content
    const headers = ['Student Name', 'Student ID', 'Course ID', 'Course Name', 'Attendance Date', 'Attendance Time', 'Assistant ID'];
    
    const csvContent = [
      // Add headers
      headers.join(','),
      // Add data rows
      ...attendance.map(record => [
        `"${record.studentName}"`, // Wrap in quotes to handle names with commas
        record.studentId,
        record.courseId,
        `"${courseName}"`,
        new Date(record.date).toLocaleDateString(),
        new Date(record.date).toLocaleTimeString(),
        record.asisstantId
      ].join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `${courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Attendance_${currentDate}.csv`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error('Failed to generate attendance file.');
  }
}; 