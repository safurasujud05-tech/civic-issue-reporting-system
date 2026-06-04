import { useState } from 'react';
import { initiateWhatsAppFlow } from '../utils/api';

export default function WhatsAppButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsappData, setWhatsappData] = useState(null);

  const handleInitiate = async () => {
    setLoading(true);
    try {
      const response = await initiateWhatsAppFlow();
      setWhatsappData(response);
    } catch (error) {
      console.error('Failed to initiate WhatsApp flow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={() => {
          setShowModal(true);
          handleInitiate();
        }}
        className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 flex items-center gap-2"
        title="Report via WhatsApp"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Report via WhatsApp</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-3" />
                <p className="text-gray-600">Loading WhatsApp options...</p>
              </div>
            ) : whatsappData ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Chat with our bot to report civic issues directly from WhatsApp!
                </p>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200 space-y-3">
                  {Object.entries(whatsappData.instructions || {}).map(([key, instruction]) => (
                    <div key={key} className="text-sm">
                      <p className="font-semibold text-green-700">{instruction}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Bot Number</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{whatsappData.phone}</p>
                </div>

                <a
                  href={`https://wa.me/${whatsappData.phone?.replace(/\D/g, '')}?text=Report`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  Open WhatsApp Chat
                </a>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                <p>Failed to load WhatsApp integration</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
