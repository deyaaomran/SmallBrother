import React, { useEffect, useState } from 'react';
import { getStudentsByCourse, Student } from '../services/studentService';
import Card from './ui/Card';
import AddStudentModal from './AddStudentModal';
import Button from './ui/Button';

interface StudentListViewProps {
  courseId: number;
  courseName: string;
  authToken: string | null;
  onClose: () => void;
}

const StudentListView: React.FC<StudentListViewProps> = ({ courseId, courseName, authToken, onClose }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getStudentsByCourse(courseId);
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const highlight = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 px-1 rounded font-semibold">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Enrolled Students</h2>
            <p className="text-indigo-100 text-sm">{courseName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              Add Students
            </Button>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search */}
          <Card variant="glass">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                className="pl-10 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </Card>

          {/* List */}
          {isLoading ? (
            <div className="text-center py-12">Loading students...</div>
          ) : error ? (
            <Card variant="glass" className="text-center py-12 text-red-600">{error}</Card>
          ) : filtered.length === 0 ? (
            <Card variant="glass" className="text-center py-12 text-gray-600">No students found</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(student => (
                <Card key={student.id} variant="glass" hover>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{highlight(student.name)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal
          courseId={courseId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchStudents();
          }}
        />
      )}
    </div>
  );
};

export default StudentListView; 