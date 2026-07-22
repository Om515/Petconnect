import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthData } from '../../../context/AuthContext';

const CaretakerApplicationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    experience: '',
    skills: [],
    availability: 'Full-time',
    hourlyRate: '',
    description: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated: isAuth } = AuthData();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (currentSkill && !formData.skills.includes(currentSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuth) {
      alert('Please login to submit an application');
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/caretaker/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          experience: Number(formData.experience),
          hourlyRate: Number(formData.hourlyRate)
        }),
        credentials: 'include'
      });

      const data = await response.json();
      if (response.ok) {
        alert('Application submitted successfully!');
        navigate('/');
      } else {
        throw new Error(data.message || 'Application failed');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-teal-50 to-cyan-100 min-h-screen py-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-teal-100">
        <h2 className="text-2xl font-bold mb-6 text-teal-700 border-b border-teal-100 pb-3">Caretaker Application</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              required
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Years of Experience</label>
            <input
              type="number"
              name="experience"
              min="0"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              required
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Skills</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                className="flex-1 px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                placeholder="Add a skill (e.g., Dog Walking)"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 shadow-md transition"
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span key={skill} className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-teal-600 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white"
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Weekends">Weekends only</option>
              <option value="Flexible">Flexible hours</option>
            </select>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Hourly Rate ($)</label>
            <input
              type="number"
              name="hourlyRate"
              min="0"
              step="0.50"
              value={formData.hourlyRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-teal-600 mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 transition shadow-md mt-6 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CaretakerApplicationForm;