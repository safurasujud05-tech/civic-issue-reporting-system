import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏛️ Civic Issue Reporter</h1>
          <p className="text-lg text-gray-600">Select your role to get started</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Admin Login */}
          <div
            onClick={() => navigate('/login/admin')}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="text-5xl mb-4">👨‍💼</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h2>
            <p className="text-gray-600 mb-6">
              Manage and monitor all civic issues reported in your area. View analytics, update status, and coordinate with departments.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> View all complaints
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Update issue status
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> View analytics & heatmap
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Department coordination
              </li>
            </ul>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Admin Login
            </button>
          </div>

          {/* Citizen Login */}
          <div
            onClick={() => navigate('/login/citizen')}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Citizen Portal</h2>
            <p className="text-gray-600 mb-6">
              Report civic issues in your area and get legal assistance. Track your complaints and receive status updates.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Report issues
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Track your complaints
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Legal assistance
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Receive notifications
              </li>
            </ul>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Citizen Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
