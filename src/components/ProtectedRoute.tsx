import React from 'react';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, fallback }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
            <svg className="h-8 w-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Authenticating...</h2>
          <p className="mt-2 text-gray-600">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Access Denied</h2>
          <p className="mt-3 text-lg text-gray-600">
            You need to login to access this page
          </p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Go to Login
            </button>
          </div>
          {fallback && (
            <div className="mt-8 p-4 bg-white/80 rounded-xl border border-gray-200">
              {fallback}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 