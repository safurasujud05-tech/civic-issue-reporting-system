// pages/Home.jsx - Landing page
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📝',
    title: 'Report Issues',
    description: 'Submit civic complaints with photos, description, and exact map location in under 2 minutes.',
  },
  {
    icon: '🤖',
    title: 'AI Classification',
    description: 'Our AI instantly categorizes your issue and routes it to the right government department.',
  },
  {
    icon: '⚖️',
    title: 'Legal Guidance',
    description: 'Get instant AI-powered advice on your legal rights and the steps to escalate your complaint.',
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'Monitor your complaint status in real-time from Submitted → In Progress → Resolved.',
  },
  {
    icon: '🗺️',
    title: 'Map Integration',
    description: 'Pin exact locations on an interactive OpenStreetMap. View all complaints geographically.',
  },
  {
    icon: '🎤',
    title: 'Voice Input',
    description: 'Can\'t type? Use your voice! Our browser-based speech recognition supports Indian English.',
  },
];

const CATEGORIES = [
  { icon: '⚡', name: 'Electricity', color: 'bg-yellow-100 text-yellow-800' },
  { icon: '💧', name: 'Water', color: 'bg-blue-100 text-blue-800' },
  { icon: '🛣️', name: 'Roads', color: 'bg-orange-100 text-orange-800' },
  { icon: '🗑️', name: 'Garbage', color: 'bg-green-100 text-green-800' },
];

const STATS = [
  { number: '500+', label: 'Issues Reported' },
  { number: '87%', label: 'Resolution Rate' },
  { number: '4', label: 'Departments Connected' },
  { number: '48h', label: 'Avg. Response Time' },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ======== HERO SECTION ======== */}
      <section className="hero-gradient pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-sky-200 text-sm font-medium px-4 py-2 rounded-full mb-6 backdrop-blur-sm border border-white/10">
            <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-dot" />
            AI-Powered Civic Issue Reporting
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Your City.
            <br />
            <span className="text-sky-300">Your Rights.</span>
            <br />
            Your Voice.
          </h1>

          <p className="text-lg text-sky-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report civic issues in seconds. Get AI legal guidance instantly.
            Track resolutions in real-time. Together, we build better cities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/report"
              className="bg-white text-sky-700 font-display font-bold px-8 py-4 rounded-xl hover:bg-sky-50 transition-colors shadow-lg text-lg"
            >
              🚀 Report an Issue
            </Link>
            <Link
              to="/legal"
              className="bg-white/10 text-white font-display font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm text-lg"
            >
              ⚖️ Get Legal Help
            </Link>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-2xl font-display font-bold text-white">{stat.number}</p>
                <p className="text-sky-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CATEGORIES SECTION ======== */}
      <section className="py-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Issue Categories We Handle
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link
                key={i}
                to={`/dashboard?category=${cat.name}`}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm ${cat.color} hover:opacity-80 transition-opacity`}
              >
                <span>{cat.icon}</span> {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FEATURES SECTION ======== */}
      <section className="py-20 px-4 section-gradient">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Everything you need to fight for your city
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A complete platform combining AI, maps, and legal knowledge to make civic participation effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500">Three simple steps to get your civic issue resolved</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-sky-100" />

            {[
              {
                step: '01',
                icon: '📝',
                title: 'Describe your issue',
                desc: 'Use text or voice to describe the civic problem. Add a photo and pin the location on the map.',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'AI classifies & routes',
                desc: 'Our AI categorizes the issue and automatically assigns it to the correct government department.',
              },
              {
                step: '03',
                icon: '📊',
                title: 'Track to resolution',
                desc: 'Monitor status updates in real-time. Get legal guidance if authorities don\'t respond.',
              },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mb-4 shadow-md z-10">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <span className="text-xs font-bold text-sky-500 tracking-widest mb-2">STEP {step.step}</span>
                <h3 className="font-display font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA SECTION ======== */}
      <section className="py-16 px-4 bg-sky-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-4">
            Ready to make your city better?
          </h2>
          <p className="text-sky-200 mb-8">
            Join thousands of citizens using CivicAI to report and resolve civic issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/report" className="bg-white text-sky-700 font-bold px-8 py-4 rounded-xl hover:bg-sky-50 transition-colors">
              Report an Issue →
            </Link>
            <Link to="/dashboard" className="bg-sky-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-sky-500 transition-colors border border-sky-500">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p className="font-display text-white font-semibold mb-1">
          🏛️ CivicAI — Report. Track. Resolve.
        </p>
        <p>Built for hackathon · Powered by OpenStreetMap & AI · Open Source</p>
      </footer>
    </div>
  );
}
