import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import Card from './ui/Card';
import Button from './ui/Button';

interface WelcomeSectionProps {
  onNavigateToCourses: () => void;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onNavigateToCourses }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock statistics - in a real app, these would come from API
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    activeClasses: 0,
    completionRate: 0
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate loading statistics with animation
    const animateStats = () => {
      const targetStats = {
        totalCourses: 12,
        totalStudents: 248,
        activeClasses: 8,
        completionRate: 89
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

    const timeout = setTimeout(animateStats, 500);
    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
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
                onClick={onNavigateToCourses}
                rightIcon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                }
              >
                View Courses
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card variant="gradient" className="group">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                  Create New Course
                </h3>
                <p className="text-gray-600">Start building your next course curriculum</p>
              </div>
              <Button variant="outline" size="sm">
                Get Started
              </Button>
            </div>
          </Card>

          <Card variant="gradient" className="group">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                  View Analytics
                </h3>
                <p className="text-gray-600">Check detailed performance metrics</p>
              </div>
              <Button variant="outline" size="sm">
                View Reports
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card variant="glass">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Recent Activity</h2>
            <p className="text-gray-600">Your latest interactions and updates</p>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Course "Advanced React" was updated', time: '2 hours ago', icon: '📚' },
              { action: 'New student enrolled in "JavaScript Basics"', time: '4 hours ago', icon: '👨‍🎓' },
              { action: 'Assignment graded for "Web Development"', time: '6 hours ago', icon: '✅' },
              { action: 'Course materials uploaded to "Python Fundamentals"', time: '1 day ago', icon: '📁' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl hover:bg-white/80 transition-colors duration-200">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
      `}</style>
    </div>
  );
};

export default WelcomeSection; 