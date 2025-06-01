import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { addStudentToCourse, uploadStudentsFile, NewStudent } from '../services/studentService';

interface AddStudentModalProps {
  courseId: number;
  onSuccess: () => void;
  onClose: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ courseId, onSuccess, onClose }) => {
  const [tab, setTab] = useState<'single' | 'upload'>('single');
  const [student, setStudent] = useState<NewStudent>({ nationalId: '', name: '', department: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await addStudentToCourse(courseId, student);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await uploadStudentsFile(courseId, file);
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl overflow-hidden animate-slideUp">
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold">Add Students</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Tabs */}
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-xl font-medium ${tab === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('single')}
            >
              Add One
            </button>
            <button
              className={`px-4 py-2 rounded-xl font-medium ${tab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('upload')}
            >
              Upload File
            </button>
          </div>

          {tab === 'single' ? (
            <Card variant="glass">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">National ID</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    value={student.nationalId}
                    onChange={e => setStudent({ ...student, nationalId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    value={student.name}
                    onChange={e => setStudent({ ...student, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
                    value={student.department}
                    onChange={e => setStudent({ ...student, department: e.target.value })}
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <Button variant="primary" fullWidth isLoading={isLoading} onClick={handleAdd}>Add Student</Button>
              </div>
            </Card>
          ) : (
            <Card variant="glass" className="space-y-4 p-6">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={e => setFile(e.target.files?.[0] || null)} />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button variant="primary" fullWidth isLoading={isLoading} onClick={handleUpload}>Upload File</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal; 