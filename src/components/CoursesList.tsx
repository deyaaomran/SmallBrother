import React, { useState, useEffect, useCallback } from 'react';
import { getAllCourses } from '../services/courseService';
import AttendanceView from './AttendanceView';
import { useAppSelector } from '../store/hooks';
import AddCourseForm from './AddCourseForm';
import Card from './ui/Card';
import Button from './ui/Button';
import StudentListView from './StudentListView';
import AddAssistantForm from './AddAssistantForm';

interface Course {
  id: number;
  name: string;
  startFrom: string;
  endIn: string;
  dayOfCourse: number;
  instructorId: number;
}

interface CoursesListProps {
  assistantId: number;
  authToken?: string | null;
}

const CoursesList: React.FC<CoursesListProps> = ({ assistantId, authToken }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState<Course | null>(null);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);
  const [selectedCourseForAssistant, setSelectedCourseForAssistant] = useState<Course | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock statistics - in a real app, these would come from API
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeClasses: 0,
    completionRate: 0
  });

  const daysOfWeek = [
    '', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const coursesData = await getAllCourses(assistantId);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  }, [assistantId]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Animate statistics based on actual courses data
    const animateStats = () => {
      const targetStats = {
        totalCourses: courses.length,
        totalStudents: courses.length * 15 + Math.floor(Math.random() * 50), // Mock calculation
        activeClasses: Math.min(courses.length, 8),
        completionRate: 85 + Math.floor(Math.random() * 10)
      };

      let currentCourses = 0;
      let currentStudents = 0;
      let currentClasses = 0;
      let currentRate = 0;

      const interval = setInterval(() => {
        if (currentCourses < targetStats.totalCourses) currentCourses++;
        if (currentStudents < targetStats.totalStudents) currentStudents += 8;
        if (currentClasses < targetStats.activeClasses) currentClasses++;
        if (currentRate < targetStats.completionRate) currentRate += 3;

        setStats({
          totalCourses: Math.min(currentCourses, targetStats.totalCourses),
          totalStudents: Math.min(currentStudents, targetStats.totalStudents),
          activeClasses: Math.min(currentClasses, targetStats.activeClasses),
          completionRate: Math.min(currentRate, targetStats.completionRate)
        });

        if (
          currentCourses >= targetStats.totalCourses &&
          currentStudents >= targetStats.totalStudents &&
          currentClasses >= targetStats.activeClasses &&
          currentRate >= targetStats.completionRate
        ) {
          clearInterval(interval);
        }
      }, 100);
    };

    if (courses.length > 0) {
      const timeout = setTimeout(animateStats, 500);
      return () => clearTimeout(timeout);
    }
  }, [courses]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddCourseModal) {
        setShowAddCourseModal(false);
      }
    };

    if (showAddCourseModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showAddCourseModal]);

  const handleCourseAdded = () => {
    setShowAddCourseModal(false);
    fetchCourses(); // Refresh the courses list
  };

  const handleCloseModal = () => {
    setShowAddCourseModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowAddCourseModal(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (now > end) {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    } else {
      return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusText = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'Upcoming';
    } else if (now > end) {
      return 'Completed';
    } else {
      return 'Active';
    }
  };

  // Add validation to ensure assistantId is valid
  useEffect(() => {
    if (!assistantId || assistantId < 1) {
      setError('Invalid assistant ID. Please login again.');
      return;
    }
  }, [assistantId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const statsData = [
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-100'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-100'
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-100'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-100'
    }
  ];

  const handleAssistantAdded = () => {
    setSelectedCourseForAssistant(null);
    // Optionally refresh the course list or show a success message
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="h-10 w-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="mt-8 text-3xl font-bold text-gray-900">
              Loading Courses...
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Fetching your course data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="mt-8 text-3xl font-bold text-gray-900">
              Error Loading Courses
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              {error}
            </p>
            <button
              onClick={fetchCourses}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header Section */}
          <Card variant="glass" className="mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.email?.split('@')[0] || 'Instructor'}! 👋
                </h1>
                <p className="text-xl text-gray-600 mt-2 font-medium">
                  Welcome to your teaching dashboard
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{formatDate(currentTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-mono text-lg font-semibold">{formatTime(currentTime)}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowAddCourseModal(true)}
                  rightIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  New Course
                </Button>
                <Button variant="outline" size="lg">
                  Settings
                </Button>
              </div>
            </div>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsData.map((stat, index) => (
              <Card key={stat.title} variant="glass" className="group hover:scale-105 transition-all duration-300" hover>
                <div className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 h-full`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                      {stat.icon}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {stat.title}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+12% from last month</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Courses Section */}
          <Card variant="glass" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Your Courses</h2>
                <p className="text-gray-600 mt-1">Manage and monitor your course activities</p>
                <div className="mt-2 text-sm text-gray-500">
                  Instructor ID: <span className="font-semibold text-purple-600">{assistantId}</span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowAddCourseModal(true)}
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add New Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-lg mb-6">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first course</p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setShowAddCourseModal(true)}
                  leftIcon={
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2">
                {courses.map((course) => (
                  <Card key={course.id} variant="gradient" className="group hover:scale-[1.02] transition-all duration-300 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl" hover>
                    <div className="space-y-4 p-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-300">
                            {course.name}
                          </h3>
                          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border mt-3 shadow-sm ${getStatusColor(course.startFrom, course.endIn)}`}>
                            <div className="w-2 h-2 bg-current rounded-full mr-2 animate-pulse"></div>
                            {getStatusText(course.startFrom, course.endIn)}
                          </div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center text-base text-gray-600">
                          <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                            <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <span className="font-medium">{new Date(course.startFrom).toLocaleDateString()} - {new Date(course.endIn).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-base text-gray-600">
                          <div className="p-2 bg-purple-50 rounded-lg mr-3">
                            <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="font-medium">{daysOfWeek[course.dayOfCourse]}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <Button
                          variant="primary"
                          size="lg"
                          fullWidth
                          onClick={() => setSelectedCourseForAttendance(course)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                        >
                          View Attendance
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => setSelectedCourseForStudents(course)}
                          className="border-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors duration-300"
                        >
                          Students
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={() => setSelectedCourseForAssistant(course)}
                          className="border-2 hover:border-purple-500 hover:text-purple-600 transition-colors duration-300"
                        >
                          Add Assistant
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card variant="gradient" className="group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                    View Analytics
                  </h3>
                  <p className="text-gray-600">Check detailed performance metrics</p>
                </div>
                <Button variant="outline" size="sm">
                  View Reports
                </Button>
              </div>
            </Card>

            <Card variant="gradient" className="group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    Manage Students
                  </h3>
                  <p className="text-gray-600">View and manage student enrollments</p>
                </div>
                <Button variant="outline" size="sm">
                  View Students
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Add Course Button */}
      {courses.length > 0 && (
        <button
          onClick={() => setShowAddCourseModal(true)}
          className="fixed bottom-8 right-8 h-16 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200 z-40 flex items-center justify-center group"
        >
          <svg className="h-8 w-8 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Enhanced Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Course</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-8">
                <AddCourseForm onSuccess={handleCourseAdded} onCancel={handleCloseModal} assistantId={assistantId} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {selectedCourseForAttendance && (
        <AttendanceView
          courseId={selectedCourseForAttendance.id}
          courseName={selectedCourseForAttendance.name}
          authToken={authToken || null}
          onClose={() => setSelectedCourseForAttendance(null)}
        />
      )}

      {/* Students Modal */}
      {selectedCourseForStudents && (
        <StudentListView
          courseId={selectedCourseForStudents.id}
          courseName={selectedCourseForStudents.name}
          authToken={authToken || null}
          onClose={() => setSelectedCourseForStudents(null)}
        />
      )}

      {/* Add Assistant Modal */}
      {selectedCourseForAssistant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideUp">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Add Assistant to {selectedCourseForAssistant.name}
              </h2>
              <button
                onClick={() => setSelectedCourseForAssistant(null)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200"
              >
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="p-8">
                <AddAssistantForm
                  courseId={selectedCourseForAssistant.id}
                  onSuccess={handleAssistantAdded}
                  onCancel={() => setSelectedCourseForAssistant(null)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CoursesList; 