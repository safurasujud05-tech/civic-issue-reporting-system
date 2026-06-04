// components/Chatbot.jsx - AI Legal Assistant chatbot interface
import { useState, useRef, useEffect } from 'react';
import { getLegalAdvice } from '../utils/api';

// Typing indicator dots
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-white rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-400 ml-1">AI is thinking...</span>
    </div>
  );
}

// Individual chat message
function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} chat-message`}>
      {!isUser && (
        <div className="w-8 h-8 bg-sky-600 rounded-xl flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-sm">
          <span className="text-sm">⚖️</span>
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {isUser ? (
          // User message - simple bubble
          <div className="bg-sky-600 text-white px-4 py-3 rounded-2xl rounded-br-sm shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        ) : (
          // AI response - rich structured content
          <div className="bg-white border border-gray-100 px-4 py-4 rounded-2xl rounded-bl-sm shadow-sm space-y-3">
            {message.advice ? (
              <AdviceCard advice={message.advice} />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">{message.content}</p>
            )}
          </div>
        )}
        <span className="text-xs text-gray-400 px-1">{message.time}</span>
      </div>
    </div>
  );
}

// Rich advice display card
function AdviceCard({ advice }) {
  return (
    <div className="space-y-4">
      {/* Topic header */}
      <div className="flex items-center gap-2">
        <span className="text-lg">⚖️</span>
        <div>
          <p className="font-semibold text-gray-900 font-display text-sm">{advice.topic} — Legal Guidance</p>
          <p className="text-xs text-gray-500">{advice.summary}</p>
        </div>
      </div>

      {/* Your Rights */}
      {advice.rights && (
        <div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">✅ Your Rights</p>
          <ul className="space-y-1.5">
            {advice.rights.map((right, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-2">
                <span className="text-emerald-500 flex-shrink-0 mt-0.5">•</span>
                <span>{right}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {advice.recommendedActions && (
        <div>
          <p className="text-xs font-bold text-sky-700 uppercase tracking-wide mb-2">🎯 Recommended Actions</p>
          <ol className="space-y-1.5">
            {advice.recommendedActions.map((action, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-2">
                <span className="text-sky-500 flex-shrink-0 font-bold">{i + 1}.</span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Authority & Law */}
      <div className="grid grid-cols-2 gap-2">
        {advice.relevantAuthority && (
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Authority</p>
            <p className="text-xs text-gray-800 mt-0.5">{advice.relevantAuthority}</p>
          </div>
        )}
        {advice.expectedTimeline && (
          <div className="bg-amber-50 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Timeline</p>
            <p className="text-xs text-gray-800 mt-0.5">{advice.expectedTimeline}</p>
          </div>
        )}
      </div>

      {/* Law reference */}
      {advice.applicableLaw && (
        <div className="bg-sky-50 rounded-lg p-2.5">
          <p className="text-xs font-semibold text-sky-600">📜 Applicable Law</p>
          <p className="text-xs text-gray-700 mt-0.5">{advice.applicableLaw}</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">
        {advice.disclaimer}
      </p>
    </div>
  );
}

// Suggested quick prompts
const QUICK_PROMPTS = [
  'Power cut for 3 days in my area',
  'No water supply for a week',
  'Large pothole causing accidents',
  'Garbage not collected for 10 days',
  'Street light not working at night',
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI Legal Assistant 👋\n\nDescribe your civic issue and I\'ll tell you your legal rights, who to contact, and what action you can take.',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // Send a message
  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || loading) return;

    setInput('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      time: getTime(),
    }]);

    setLoading(true);

    try {
      const result = await getLegalAdvice(userMessage);
      const adviceObject = result?.advice && typeof result.advice === 'object' ? result.advice : null;
      const aiMessage = {
        role: 'ai',
        content: adviceObject ? '' : result?.message || result?.advice || '❌ Sorry, I couldn\'t get legal advice right now. Please try again.',
        advice: adviceObject,
        time: getTime(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '❌ Sorry, I couldn\'t get legal advice right now. Please make sure the server is running and try again.',
        time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice input for chatbot
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Chat header */}
      <div className="bg-sky-700 px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="text-xl">⚖️</span>
        </div>
        <div>
          <h3 className="text-white font-display font-semibold">AI Legal Assistant</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
            <span className="text-sky-200 text-xs">Online — Powered by AI</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 bg-sky-600 rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
              <span className="text-sm">⚖️</span>
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2 font-medium">💡 Try asking about:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-white text-sky-700 border border-sky-200 rounded-full px-3 py-1.5 hover:bg-sky-50 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your civic issue..."
              className="form-input pr-10 py-2.5 text-sm"
              disabled={loading}
            />
            {/* Voice button */}
            <button
              onClick={toggleVoice}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-sky-600'
              }`}
            >
              🎤
            </button>
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {isListening && (
          <p className="text-xs text-red-500 mt-1 animate-pulse">🔴 Listening...</p>
        )}
      </div>
    </div>
  );
}
