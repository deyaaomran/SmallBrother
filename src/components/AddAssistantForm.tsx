import React, { useState } from 'react';
import { addAssistantToCourse } from '../services/courseService';
import Button from './ui/Button';
import Card from './ui/Card';

interface AddAssistantFormProps {
  courseId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const AddAssistantForm: React.FC<AddAssistantFormProps> = ({ courseId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await addAssistantToCourse(courseId, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Assistant Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter assistant name"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter password"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          required
          value={formData.phoneNumber}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Enter phone number"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Add Assistant
        </Button>
      </div>
    </form>
  );
};

export default AddAssistantForm; 