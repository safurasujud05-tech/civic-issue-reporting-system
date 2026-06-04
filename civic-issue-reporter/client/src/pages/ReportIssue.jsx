// pages/ReportIssue.jsx - Page to submit a new complaint
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ComplaintForm from '../components/ComplaintForm';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-100 rounded-2xl mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Report a Civic Issue
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Describe your issue and our AI will automatically classify it and route it
            to the correct authority. Use voice input if you prefer speaking.
          </p>
        </div>

        {/* Info banners */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🤖', text: 'Auto-classified by AI' },
            { icon: '📡', text: 'Auto-routed to dept.' },
            { icon: '📊', text: 'Track in real-time' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <p className="text-xl mb-1">{item.icon}</p>
              <p className="text-xs text-gray-600 font-medium">{item.text}</p>
            </div>
          ))}
        </div>

        {/* The actual form */}
        <div className="card shadow-sm">
          <ComplaintForm />
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Your complaint is submitted anonymously. We do not collect personal data.
        </p>
      </div>
    </div>
  );
}
