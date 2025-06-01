import React, { useState } from 'react';
import { addCourse } from '../services/courseService';

interface AddCourseFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  assistantId?: number;
}

interface CourseFormData {
  name: string;
  startFrom: string;
  endIn: string;
  dayOfCourse: number;
  assistantId: number;
}

interface FormErrors {
  name?: string;
  startFrom?: string;
  endIn?: string;
  dayOfCourse?: string;
  assistantId?: string;
  general?: string;
}

const AddCourseForm: React.FC<AddCourseFormProps> = ({ onSuccess, onCancel, assistantId }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    name: '',
    startFrom: '',
    endIn: '',
    dayOfCourse: 1,
    assistantId: assistantId || 5
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const daysOfWeek = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
  ];

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Course name must be at least 2 characters';
    }

    if (!formData.startFrom) {
      newErrors.startFrom = 'Start date is required';
    }

    if (!formData.endIn) {
      newErrors.endIn = 'End date is required';
    }

    if (formData.startFrom && formData.endIn) {
      const startDate = new Date(formData.startFrom);
      const endDate = new Date(formData.endIn);
      
      if (endDate <= startDate) {
        newErrors.endIn = 'End date must be after start date';
      }
    }

    if (!formData.assistantId || formData.assistantId < 1) {
      newErrors.assistantId = 'Assistant ID is required and must be positive';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await addCourse(formData);
      console.log('Course added successfully:', response);
      
      setShowSuccess(true);
      setFormData({
        name: '',
        startFrom: '',
        endIn: '',
        dayOfCourse: 1,
        assistantId: assistantId || 5
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
      }, 3000);
    } catch (error: any) {
      setErrors({
        general: error.message || 'Failed to add course. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dayOfCourse' || name === 'assistantId' ? parseInt(value) : value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Success Animation Component
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent">
              Course Added!
            </h2>
            <p className="mt-3 text-lg text-gray-600 font-medium">
              Your course has been successfully created
            </p>
            <div className="mt-6 w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Add New Course
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            Create a new course for your students
          </p>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto rounded-full"></div>
        </div>

        {/* Form Container */}
        <div className="backdrop-blur-lg bg-white/80 shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="px-8 py-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* General Error */}
              {errors.general && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium shadow-sm animate-shake">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.general}
                  </div>
                </div>
              )}

              {/* Course Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 tracking-wide">
                  Course Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-emerald-500'
                    } rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-lg font-medium bg-gray-50/50 backdrop-blur-sm`}
                    placeholder="Enter course name"
                  />
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                    errors.name ? 'shadow-red-100' : 'group-focus-within:shadow-emerald-100'
                  } group-focus-within:shadow-lg`}></div>
                </div>
                {errors.name && (
                  <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Date Fields Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date Field */}
                <div className="space-y-2">
                  <label htmlFor="startFrom" className="block text-sm font-semibold text-gray-800 tracking-wide">
                    Start Date
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="startFrom"
                      name="startFrom"
                      type="date"
                      value={formData.startFrom}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 ${
                        errors.startFrom 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-emerald-500'
                      } rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-lg font-medium bg-gray-50/50 backdrop-blur-sm`}
                    />
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                      errors.startFrom ? 'shadow-red-100' : 'group-focus-within:shadow-emerald-100'
                    } group-focus-within:shadow-lg`}></div>
                  </div>
                  {errors.startFrom && (
                    <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.startFrom}
                    </p>
                  )}
                </div>

                {/* End Date Field */}
                <div className="space-y-2">
                  <label htmlFor="endIn" className="block text-sm font-semibold text-gray-800 tracking-wide">
                    End Date
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="endIn"
                      name="endIn"
                      type="date"
                      value={formData.endIn}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 ${
                        errors.endIn 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-emerald-500'
                      } rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-lg font-medium bg-gray-50/50 backdrop-blur-sm`}
                    />
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                      errors.endIn ? 'shadow-red-100' : 'group-focus-within:shadow-emerald-100'
                    } group-focus-within:shadow-lg`}></div>
                  </div>
                  {errors.endIn && (
                    <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.endIn}
                    </p>
                  )}
                </div>
              </div>

              {/* Day of Week and Assistant ID Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Day of Week Field */}
                <div className="space-y-2">
                  <label htmlFor="dayOfCourse" className="block text-sm font-semibold text-gray-800 tracking-wide">
                    Day of Week
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      id="dayOfCourse"
                      name="dayOfCourse"
                      value={formData.dayOfCourse}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 ${
                        errors.dayOfCourse 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-emerald-500'
                      } rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-lg font-medium bg-gray-50/50 backdrop-blur-sm appearance-none`}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                      errors.dayOfCourse ? 'shadow-red-100' : 'group-focus-within:shadow-emerald-100'
                    } group-focus-within:shadow-lg`}></div>
                  </div>
                  {errors.dayOfCourse && (
                    <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.dayOfCourse}
                    </p>
                  )}
                </div>

                {/* Assistant ID Field */}
                <div className="space-y-2">
                  <label htmlFor="assistantId" className="block text-sm font-semibold text-gray-800 tracking-wide">
                    Assistant ID
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      id="assistantId"
                      name="assistantId"
                      type="number"
                      min="1"
                      value={formData.assistantId}
                      onChange={handleInputChange}
                      className={`block w-full pl-12 pr-4 py-4 border-2 ${
                        errors.assistantId 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-emerald-500'
                      } rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-lg font-medium bg-gray-50/50 backdrop-blur-sm`}
                      placeholder="Enter assistant ID"
                    />
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-200 pointer-events-none ${
                      errors.assistantId ? 'shadow-red-100' : 'group-focus-within:shadow-emerald-100'
                    } group-focus-within:shadow-lg`}></div>
                  </div>
                  {errors.assistantId && (
                    <p className="text-red-600 text-sm font-medium flex items-center mt-2">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.assistantId}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-2xl text-white transition-all duration-200 transform ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed scale-95'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-xl hover:shadow-2xl'
                  } active:scale-95`}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                    {isLoading ? (
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </span>
                  {isLoading ? 'Adding Course...' : 'Add Course'}
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Course Information</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Make sure all course details are correct before submitting.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourseForm; 