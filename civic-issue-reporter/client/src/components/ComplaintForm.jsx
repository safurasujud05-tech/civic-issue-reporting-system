// components/ComplaintForm.jsx - Full complaint submission form
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from './MapPicker';
import { submitComplaint } from '../utils/api';

export default function ComplaintForm({ onSuccess }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
  });
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Voice input state
  const [isListening, setIsListening] = useState(false);
  const [voiceField, setVoiceField] = useState(null); // 'title' or 'description'
  const recognitionRef = useRef(null);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Handle location from map
  const handleLocationChange = (loc) => {
    setLocation(loc);
  };

  // ============================================================
  // VOICE INPUT - Browser Speech Recognition API
  // ============================================================
  const startVoiceInput = (fieldName) => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    // Stop if already listening
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setVoiceField(null);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceField(fieldName);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm(prev => ({
        ...prev,
        [fieldName]: prev[fieldName] ? `${prev[fieldName]} ${transcript}` : transcript,
      }));
    };

    recognition.onerror = (event) => {
      console.error('Voice error:', event.error);
      setIsListening(false);
      setVoiceField(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceField(null);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ============================================================
  // FORM SUBMISSION
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill in title and description');
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for multipart upload (supports image)
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);

      if (location) {
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
        formData.append('location_name', location.location_name);
      }

      if (image) {
        formData.append('image', image);
      }

      const result = await submitComplaint(formData);
      setSuccess(result);

      // Reset form
      setForm({ title: '', description: '' });
      setLocation(null);
      setImage(null);
      setImagePreview(null);

      if (typeof onSuccess === 'function') {
        onSuccess(result);
      } else {
        // Redirect to dashboard after 3 seconds for standard complaint flow
        setTimeout(() => navigate('/dashboard'), 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Is the server running?');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success message */}
      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-semibold text-emerald-800 font-display">Complaint Submitted!</h3>
              <p className="text-emerald-700 text-sm mt-1">
                Your issue has been classified as <strong>{success.classification?.category}</strong> and
                routed to <strong>{success.classification?.department}</strong>.
              </p>
              <p className="text-emerald-600 text-xs mt-2">
                {typeof onSuccess === 'function'
                  ? 'Your complaint is submitted and will appear in your dashboard shortly.'
                  : 'Redirecting to dashboard...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="form-label" htmlFor="title">
            Issue Title *
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Broken street light on Main Road"
              className="form-input pr-12"
              required
            />
            {/* Voice button */}
            <button
              type="button"
              onClick={() => startVoiceInput('title')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                isListening && voiceField === 'title'
                  ? 'text-red-500 bg-red-50 animate-pulse'
                  : 'text-gray-400 hover:text-sky-600 hover:bg-sky-50'
              }`}
              title="Voice input"
            >
              🎤
            </button>
          </div>
          {isListening && voiceField === 'title' && (
            <p className="text-xs text-red-500 mt-1 animate-pulse">🔴 Listening... speak now</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="form-label" htmlFor="description">
            Description *
          </label>
          <div className="relative">
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail. When did it start? How is it affecting residents? What have you already tried?"
              rows={4}
              className="form-input resize-none pr-12"
              required
            />
            {/* Voice button for description */}
            <button
              type="button"
              onClick={() => startVoiceInput('description')}
              className={`absolute right-3 top-3 p-1.5 rounded-lg transition-colors ${
                isListening && voiceField === 'description'
                  ? 'text-red-500 bg-red-50 animate-pulse'
                  : 'text-gray-400 hover:text-sky-600 hover:bg-sky-50'
              }`}
              title="Voice input"
            >
              🎤
            </button>
          </div>
          {isListening && voiceField === 'description' && (
            <p className="text-xs text-red-500 mt-1 animate-pulse">🔴 Listening... speak now</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">
            💡 Tip: Use the 🎤 button for voice input in English
          </p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="form-label">Upload Photo (optional)</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📷</p>
                <p className="text-gray-600 text-sm font-medium">Click to upload photo</p>
                <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Location Picker */}
        <div>
          <label className="form-label">Location</label>
          <MapPicker onLocationChange={handleLocationChange} />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full btn-primary flex items-center justify-center gap-2 py-4 text-base ${
            submitting ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? (
            <>
              <span className="spinner inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Submitting...
            </>
          ) : (
            <>🚀 Submit Complaint</>
          )}
        </button>
      </form>
    </div>
  );
}
