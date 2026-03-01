import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-violet-900/30 border border-violet-700/30 rounded-full text-violet-300 text-sm">
          ⚡ Feature flags for indie SaaS
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Ship smarter with{' '}
          <span className="text-violet-400">FeatureKit</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Feature flags, A/B testing, and targeting rules — at 1/10th the price of LaunchDarkly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
          >
            Start Free →
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6 text-left">
          {[
            { icon: '🚀', title: 'Ship fearlessly', desc: 'Toggle features for any % of users' },
            { icon: '🎯', title: 'Targeting rules', desc: 'Target by email, country, user ID' },
            { icon: '🧪', title: 'A/B testing', desc: 'Run experiments with variants' },
          ].map((f) => (
            <div key={f.title} className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="text-2xl mb-2">{f.icon}</div>
              <div className="font-semibold text-white">{f.title}</div>
              <div className="text-sm text-gray-400 mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
