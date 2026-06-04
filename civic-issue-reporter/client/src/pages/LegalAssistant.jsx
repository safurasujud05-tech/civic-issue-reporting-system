// pages/LegalAssistant.jsx - AI Legal Help page
import Chatbot from '../components/Chatbot';

const LEGAL_TOPICS = [
  {
    icon: '⚡',
    title: 'Electricity Rights',
    points: ['Right to uninterrupted supply (Electricity Act 2003)', 'Compensation for outage damages', 'Escalate to SERC'],
    law: 'Electricity Act, 2003',
  },
  {
    icon: '💧',
    title: 'Water Rights',
    points: ['Clean water is a fundamental right (Art. 21)', 'File RTI for supply schedule', 'Escalate to District Collector'],
    law: 'Environment Protection Act 1986',
  },
  {
    icon: '🛣️',
    title: 'Road Rights',
    points: ['Safe roads required under Motor Vehicles Act', 'Claim compensation for pothole accidents', 'File PIl for persistent issues'],
    law: 'Motor Vehicles Act, 1988',
  },
  {
    icon: '🗑️',
    title: 'Garbage Rights',
    points: ['Right to clean environment (Art. 48A)', 'Regular collection is mandatory', 'Report to Pollution Control Board'],
    law: 'Solid Waste Management Rules 2016',
  },
];

export default function LegalAssistant() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sky-100 rounded-2xl mb-4">
            <span className="text-3xl">⚖️</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            AI Legal Assistant
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            Know your civic rights. Get instant AI guidance on legal recourse, escalation paths,
            and applicable laws — all tailored to your specific complaint.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Chatbot - left/main */}
          <div className="lg:col-span-3">
            <Chatbot />
          </div>

          {/* Right sidebar: quick reference */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="font-display font-semibold text-gray-800 mb-3">
                Quick Reference
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Common civic rights by category. Click the chatbot to get detailed guidance.
              </p>
            </div>

            {LEGAL_TOPICS.map((topic, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{topic.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">{topic.title}</h3>
                    <p className="text-xs text-gray-400">{topic.law}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {topic.points.map((point, j) => (
                    <li key={j} className="flex gap-2 text-xs text-gray-600">
                      <span className="text-sky-400 flex-shrink-0">→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Disclaimer box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">⚠️ Disclaimer</p>
              <p className="text-xs text-amber-600 leading-relaxed">
                This AI provides general legal information based on Indian law. It is not a substitute
                for professional legal advice. For specific cases, consult a qualified lawyer.
              </p>
            </div>
          </div>
        </div>

        {/* Useful links */}
        <div className="mt-10 card">
          <h3 className="font-display font-semibold text-gray-800 mb-4">
            🔗 Useful Government Portals
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'CPGRAMS', desc: 'Centralized grievance portal', url: 'https://cpgrams.gov.in' },
              { name: 'MyGov', desc: 'Citizen engagement platform', url: 'https://mygov.in' },
              { name: 'Swachh Bharat App', desc: 'Sanitation complaints', url: 'https://swachhbharaturban.gov.in' },
              { name: 'RTI Online', desc: 'File Right to Information', url: 'https://rtionline.gov.in' },
              { name: 'Lokpal', desc: 'Corruption complaints', url: 'https://lokpal.gov.in' },
              { name: 'NITI Aayog', desc: 'Policy feedback', url: 'https://niti.gov.in' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50/50 transition-all group"
              >
                <span className="text-lg">🌐</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-sky-700">{link.name}</p>
                  <p className="text-xs text-gray-400">{link.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
