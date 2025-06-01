import React, { useState, useEffect } from 'react';
import { getCourseAttendance } from '../services/attendanceService';
import Button from './ui/Button';
import Card from './ui/Card';

interface AttendanceRecord {
  date: string;
  time: string | null;
  studentName: string;
  studentId: number;
  courseId: number;
  asisstantId: number;
}

interface Student {
  id: number;
  name: string;
  image: string | null;
  attendedClasses: number;
  absences: number;
  excusedAbsences: number;
  totalClasses: number;
}

interface Attendance {
  date: string;
  id: number;
  listStudent: Student[];
}

interface AttendanceViewProps {
  courseId: number;
  courseName: string;
  authToken: string | null;
  onClose: () => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ courseId, courseName, authToken, onClose }) => {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchAttendanceData();
  }, [courseId]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCourseAttendance(courseId);
      
      // Transform flat attendance records into grouped by date structure
      const groupedData: { [key: string]: AttendanceRecord[] } = {};
      data.forEach(record => {
        const isoDate = new Date(record.date).toISOString().split('T')[0]; // yyyy-mm-dd
        if (!groupedData[isoDate]) {
          groupedData[isoDate] = [];
        }
        groupedData[isoDate].push(record);
      });
      
      // Convert grouped data to the expected structure
      const transformedData: Attendance[] = Object.entries(groupedData).map(([date, records], index) => ({
        date: date,
        id: index,
        listStudent: records.map(record => ({
          id: record.studentId,
          name: record.studentName,
          image: null,
          attendedClasses: 1, // Since this is attendance data, they attended
          absences: 0,
          excusedAbsences: 0,
          totalClasses: 1
        }))
      }));
      
      setAttendanceData(transformedData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = attendanceData.filter(attendance => {
    // First apply date filter
    const dateMatch = !selectedDate || attendance.date === selectedDate;
    
    // Then apply name search filter
    const searchMatch = attendance.listStudent.some(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return dateMatch && searchMatch;
  });

  const filteredStudents = (students: Student[]) => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const downloadAttendanceAsCSV = () => {
    setIsDownloading(true);
    
    try {
      // Create CSV content
      let csvContent = 'Date,Student Name,Attended Classes,Absences,Excused Absences,Total Classes,Attendance %\n';
      
      filteredData.forEach(attendance => {
        filteredStudents(attendance.listStudent).forEach(student => {
          const attendancePercentage = student.totalClasses > 0
            ? ((student.attendedClasses / student.totalClasses) * 100).toFixed(2)
            : '0';
          
          csvContent += `${attendance.date},"${student.name}",${student.attendedClasses},${student.absences},${student.excusedAbsences},${student.totalClasses},${attendancePercentage}%\n`;
        });
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attendance_course_${courseId}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attendance:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={index} className="bg-yellow-200 font-semibold rounded px-1">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const calculateOverallStats = () => {
    let totalStudents = 0;
    let totalAttended = 0;
    let totalClasses = 0;
    let totalAbsences = 0;

    filteredData.forEach(attendance => {
      filteredStudents(attendance.listStudent).forEach(student => {
        totalStudents++;
        totalAttended += student.attendedClasses;
        totalClasses += student.totalClasses;
        totalAbsences += student.absences;
      });
    });

    const averageAttendance = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

    return {
      totalStudents: totalStudents / (filteredData.length || 1),
      averageAttendance: averageAttendance.toFixed(2),
      totalAbsences
    };
  };

  const stats = calculateOverallStats();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Attendance Management</h2>
              <p className="text-indigo-100 text-lg">{courseName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 group"
            >
              <svg className="h-6 w-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-spin">
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading attendance data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8">
              <Card variant="glass">
                <div className="text-center py-8">
                  <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium mb-4">{error}</p>
                  <Button variant="primary" onClick={fetchAttendanceData}>
                    Try Again
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card variant="gradient">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{stats.averageAttendance}%</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card variant="gradient">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{Math.round(stats.totalStudents)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card variant="gradient">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Absences</p>
                      <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalAbsences}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Search and Filter Controls */}
              <Card variant="glass">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by student name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                    />
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    onClick={downloadAttendanceAsCSV}
                    isLoading={isDownloading}
                    disabled={isDownloading || filteredData.length === 0}
                    leftIcon={
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    }
                  >
                    {isDownloading ? 'Downloading...' : 'Download CSV'}
                  </Button>
                </div>
              </Card>

              {/* Attendance Data */}
              {filteredData.length === 0 ? (
                <Card variant="glass">
                  <div className="text-center py-12">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xl font-medium text-gray-600">No attendance records found</p>
                    <p className="text-gray-500 mt-2">
                      {searchTerm || selectedDate ? 'Try adjusting your filters' : 'No data available for this course'}
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredData.map((attendance) => {
                    const students = filteredStudents(attendance.listStudent);
                    if (students.length === 0) return null;

                    return (
                      <Card key={attendance.id} variant="glass">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg className="h-6 w-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(attendance.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-gray-600 mt-1">{students.length} students</p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 rounded-xl">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Attended
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Absences
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Excused
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Total Classes
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Attendance %
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {students.map((student) => {
                                const attendancePercentage = student.totalClasses > 0
                                  ? (student.attendedClasses / student.totalClasses) * 100
                                  : 0;

                                return (
                                  <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-4 py-4">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                          {student.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-900">
                                          {highlightSearchTerm(student.name)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className="px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                                        {student.attendedClasses}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                        student.absences > 0 
                                          ? 'text-red-700 bg-red-100' 
                                          : 'text-gray-700 bg-gray-100'
                                      }`}>
                                        {student.absences}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <span className="px-3 py-1 text-sm font-semibold text-yellow-700 bg-yellow-100 rounded-full">
                                        {student.excusedAbsences}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-center font-medium text-gray-700">
                                      {student.totalClasses}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                      <div className="flex items-center justify-center">
                                        <span className={`font-bold ${
                                          attendancePercentage >= 80 ? 'text-green-600' :
                                          attendancePercentage >= 60 ? 'text-yellow-600' :
                                          'text-red-600'
                                        }`}>
                                          {attendancePercentage.toFixed(1)}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceView; 