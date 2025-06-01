import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { loginSuccess, logout } from './store/slices/authSlice';
import { setCurrentPage, setShowWelcome } from './store/slices/uiSlice';

// Components
import LoginForm from './components/LoginForm';
import CoursesList from './components/CoursesList';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentPage, showWelcome } = useAppSelector((state) => state.ui);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch(loginSuccess(userData));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);

  const handleLoginSuccess = (userData: any) => {
    console.log('=== AppRouter: Processing Login Success ===');
    console.log('Received userData:', userData);
    console.log('Instructor ID from login:', userData.instructorId);
    console.log('Auth Token from login:', userData.authToken ? 'Present' : 'Missing');
    
    // Validate that we have the required instructor ID
    if (userData.instructorId === null || userData.instructorId === undefined || isNaN(userData.instructorId)) {
      console.error('Invalid or missing instructor ID:', userData.instructorId);
      alert('Login successful, but no valid instructor ID was received. Please contact your system administrator.');
      return;
    }
    
    const user = {
      email: userData.email || 'instructor@example.com',
      assistantId: userData.instructorId, // Use the actual ID from login response
      authToken: userData.authToken || null
    };

    console.log('=== Final User Object ===');
    console.log('Email:', user.email);
    console.log('Assistant ID (from API):', user.assistantId);
    console.log('Has Auth Token:', !!user.authToken);
    console.log('========================');

    // Save to localStorage for persistence
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update Redux state
    dispatch(loginSuccess(user));
    dispatch(setShowWelcome(true));
    
    // Show welcome message briefly before navigating
    setTimeout(() => {
      dispatch(setShowWelcome(false));
      dispatch(setCurrentPage('coursesList'));
      navigate('/courses');
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    dispatch(logout());
    dispatch(setCurrentPage('login'));
    navigate('/login');
  };

  const handleNavigation = (page: 'login' | 'welcome' | 'coursesList') => {
    dispatch(setCurrentPage(page));
    switch (page) {
      case 'welcome':
      case 'coursesList':
        navigate('/courses');
        break;
      case 'login':
        navigate('/login');
        break;
    }
  };

  const getBackgroundGradient = () => {
    if (showWelcome) {
      return 'from-green-50 via-emerald-50 to-teal-100';
    }
    
    switch (currentPage) {
      case 'login':
        return 'from-blue-50 via-indigo-50 to-purple-100';
      case 'coursesList':
        return 'from-indigo-50 via-purple-50 to-pink-100';
      default:
        return 'from-blue-50 via-indigo-50 to-purple-100';
    }
  };

  const getBackgroundElements = () => {
    if (showWelcome) {
      return (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-teal-400/10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </>
      );
    }

    switch (currentPage) {
      case 'login':
        return (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-indigo-400/10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-b from-blue-200/20 to-transparent rounded-full blur-3xl"></div>
          </>
        );
      case 'coursesList':
        return (
          <>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-pink-400/10"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-t from-purple-200/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-b from-indigo-200/20 to-transparent rounded-full blur-3xl"></div>
          </>
        );
      default:
        return null;
    }
  };

  if (showWelcome) {
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
              Welcome Back!
            </h2>
            <p className="mt-3 text-lg text-gray-600 font-medium">
              Login successful. Loading your courses...
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
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} relative overflow-hidden transition-colors duration-500`}>
      {/* Background elements for depth */}
      <div className="absolute inset-0">
        {getBackgroundElements()}
      </div>

      {/* Navigation - Only show when logged in and not in welcome screen */}
      {isAuthenticated && !showWelcome && (
        <Navigation 
          user={user!} 
          currentPage={currentPage}
          onNavigate={(page) => handleNavigation(page)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <div className={isAuthenticated && !showWelcome ? 'pt-20' : ''}>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/courses" replace /> : 
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            } 
          />
          <Route 
            path="/courses" 
            element={
              <ProtectedRoute>
                {user?.assistantId !== null && user?.assistantId !== undefined && !isNaN(user.assistantId) ? (
                  <CoursesList 
                    assistantId={user.assistantId} 
                    authToken={user.authToken} 
                  />
                ) : (
                  <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full text-center">
                      <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Session</h2>
                      <p className="text-gray-600 mb-6">Your instructor ID is missing. Please log in again.</p>
                      <button
                        onClick={() => {
                          localStorage.removeItem('user');
                          dispatch(logout());
                          navigate('/login');
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                      >
                        Back to Login
                      </button>
                    </div>
                  </div>
                )}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <Navigate to={isAuthenticated ? "/courses" : "/login"} replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default AppRouter; 