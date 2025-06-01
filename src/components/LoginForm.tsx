import React, { useState, useEffect } from 'react';
import { loginInstructor } from '../services/authService';
import Button from './ui/Button';
import Card from './ui/Card';

interface LoginFormProps {
  onLoginSuccess: (userData: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Clear any existing session data on component mount
  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }, []);

  const clearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    setDebugInfo(null);
    setError(null);
    alert('All cached data cleared. Please login again.');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors and debug info
    setError(null);
    setDebugInfo(null);

    // Validation
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with email:', email);
      const response = await loginInstructor(email, password);
      
      // Store debug info for development
      setDebugInfo({
        rawResponse: response,
        extractedData: {
          email: response.email || email,
          instructorId: response.instructorId,
          hasToken: !!response.authToken,
          apiFields: Object.keys(response || {}),
          asisstantIdValue: response.asisstantId,
          allIdFields: {
            asisstantId: response.asisstantId,
            assistantId: response.assistantId,
            instructorId: response.instructorId,
            id: response.id,
            userId: response.userId
          }
        }
      });

      console.log('Login response received:', {
        hasEmail: !!response.email,
        hasInstructorId: !!response.instructorId,
        hasToken: !!response.authToken,
        instructorIdValue: response.instructorId
      });

      // Ensure we have the minimum required data
      const userData = {
        email: response.email || email,
        instructorId: response.instructorId, // No fallback - must come from API
        authToken: response.authToken || null
      };

      // Validate that we have a valid instructor ID
      if (userData.instructorId === null || userData.instructorId === undefined || isNaN(userData.instructorId)) {
        throw new Error('Login successful, but no valid instructor ID was received from the server. Please contact your system administrator.');
      }

      console.log('Calling onLoginSuccess with:', userData);
      onLoginSuccess(userData);
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setDebugInfo({ error: err.message, details: err });
      
      // Provide user-friendly error messages
      let errorMessage = err.message || 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (errorMessage.includes('Network error')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (errorMessage.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (errorMessage.includes('No instructor ID')) {
        errorMessage = 'Login successful, but there was an issue with your instructor profile. Please contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          
          <h2 className="mt-6 text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Sign in to your instructor account
          </p>
        </div>

        <Card variant="glass">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 animate-shake">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 pl-12 border-2 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:z-10 transition-all duration-200 ${
                    error && !email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none relative block w-full px-4 py-3 pl-12 pr-12 border-2 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:z-10 transition-all duration-200 ${
                    error && !password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/70'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.543 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button 
                variant="primary"
                type="submit"
                fullWidth 
                size="lg"
                isLoading={isLoading}
                leftIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                }
              >
                {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
              </Button>

              {/* Debug Panel - Only show in development */}
              {debugInfo && process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 API Response Debug:</h4>
                  <div className="text-xs text-gray-600 font-mono bg-white p-3 rounded border max-h-40 overflow-y-auto">
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <p><strong>Expected fields for instructor ID:</strong></p>
                    <p className="font-mono">assistantid, assistantId, instructorId, id, userId</p>
                    <p className="text-red-600">⚠️ If none of these fields contain a valid number, contact your API developer.</p>
                  </div>
                </div>
              )}

              {/* Clear Cache Button */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={clearAllData}
                  className="text-sm text-red-600 hover:text-red-700 underline"
                >
                  🗑️ Clear All Cached Data & Force Fresh Login
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">GitHub</span>
              </button>

              <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="ml-2">Google</span>
              </button>
            </div>
          </div>
        </Card>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="#" className="font-medium text-purple-600 hover:text-purple-500">
            Contact your administrator
          </a>
        </p>
      </div>

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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default LoginForm; 