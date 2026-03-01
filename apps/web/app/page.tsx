import Link from 'next/link';

const CODE_SNIPPET = `import { FeatureKit } from '@featurekit/js';

const fk = new FeatureKit('pk_live_...');

if (await fk.isEnabled('dark-mode', { userId: user.id })) {
  enableDarkMode();
}`;

const FEATURES = [
  { emoji: '⚡', title: 'Instant Toggles', desc: 'Flip flags without deploys. Changes propagate in seconds across all your users.' },
  { emoji: '🎯', title: 'Targeting Rules', desc: 'Target by userId, email, country, or percentage rollout. Built-in rule builder.' },
  { emoji: '🧪', title: 'A/B Variants', desc: 'Run experiments with consistent user assignment. Track conversions and pick winners.' },
  { emoji: '🛡️', title: 'Kill Switches', desc: 'Disable any feature in seconds. No redeploy, no downtime, no panic.' },
  { emoji: '📦', title: 'SDK-First', desc: 'JS, React, Python SDKs. One line of code. Edge-ready with 60s cache.' },
  { emoji: '📊', title: 'Analytics', desc: 'See flag evaluation counts and conversion rates. Know what ships.' },
];

const COMPARISON = [
  { feature: 'Price', featurekit: '$9/mo', launchdarkly: '$500+/mo', optimizely: '$36k/yr' },
  { feature: 'Free tier', featurekit: '✅ 5 flags', launchdarkly: '❌', optimizely: '❌' },
  { feature: 'SDK languages', featurekit: '3+', launchdarkly: '20+', optimizely: '5+' },
  { feature: 'A/B testing', featurekit: '✅', launchdarkly: '✅', optimizely: '✅' },
  { feature: 'Targeting rules', featurekit: '✅', launchdarkly: '✅', optimizely: '✅' },
  { feature: 'Indie-friendly', featurekit: '✅', launchdarkly: '❌', optimizely: '❌' },
];

const STEPS = [
  { step: '01', title: 'Install SDK', desc: 'npm install @featurekit/js — one command and you\'re ready.' },
  { step: '02', title: 'Create Flags', desc: 'Use the dashboard to create flags, set rollout %, and add targeting rules.' },
  { step: '03', title: 'Ship Safely', desc: 'Toggle features for any group of users without touching your code.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Perfect to get started',
    features: ['5 flags', '1 project', 'JS SDK', 'Community support'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Indie',
    price: '$9/mo',
    desc: 'For solo founders',
    features: ['Unlimited flags', '3 projects', 'All SDKs', 'A/B testing', 'Email support'],
    cta: 'Get Indie',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29/mo',
    desc: 'For small teams',
    features: ['Unlimited everything', '10 projects', 'Advanced A/B', 'Targeting rules', '5 team seats', 'Priority support'],
    cta: 'Get Team',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote: "Switched from LaunchDarkly and saved $491/month. FeatureKit has everything we actually use.",
    author: 'Mia K.',
    role: 'Solo founder, SaaS startup',
  },
  {
    quote: "The targeting rules are surprisingly powerful. I can ship to 5% of beta users with one click.",
    author: 'James R.',
    role: 'Indie dev, ProductLab',
  },
  {
    quote: "Finally a feature flag tool that doesn't charge enterprise prices for indie-scale usage.",
    author: 'Priya N.',
    role: 'CTO, 3-person startup',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-violet-400">
            ⚡ FeatureKit
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
            <a href="#" className="hover:text-white transition">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition px-3 py-1.5">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
            >
              Start Free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-violet-900/30 border border-violet-700/30 rounded-full text-violet-300 text-sm">
          🚀 LaunchDarkly alternative at 1/10th the price
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Feature flags that{' '}
          <span className="text-violet-400">don&apos;t cost a fortune</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Ship safely, test ideas, and target users — without paying $500/month for a tool that does the same thing.
        </p>
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link
            href="/signup"
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition"
          >
            Start Free →
          </Link>
          <a
            href="#"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition border border-gray-700"
          >
            View Docs
          </a>
        </div>

        {/* Code snippet */}
        <div className="max-w-xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden text-left shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-800/60">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-gray-500">app.js</span>
          </div>
          <pre className="p-5 text-sm text-gray-300 font-mono overflow-x-auto">
            {CODE_SNIPPET}
          </pre>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Free tier', value: '5 flags' },
              { label: 'Pro plan', value: '$9/mo' },
              { label: 'SDK size', value: '<2KB' },
              { label: 'Cache TTL', value: '60s' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-violet-400">{value}</div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Everything you need, nothing you don&apos;t</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            FeatureKit ships the core features that actually matter — without the bloat or the bill.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-violet-700/40 transition group"
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <div className="font-semibold text-white mb-2 group-hover:text-violet-300 transition">{title}</div>
              <div className="text-sm text-gray-400">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">How we stack up</h2>
          <p className="text-gray-400">The same core features. A fraction of the price.</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-gray-500 font-medium">Feature</th>
                <th className="px-6 py-4 text-center">
                  <span className="text-violet-400 font-bold">FeatureKit</span>
                </th>
                <th className="px-6 py-4 text-center text-gray-400 font-medium">LaunchDarkly</th>
                <th className="px-6 py-4 text-center text-gray-400 font-medium">Optimizely</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {COMPARISON.map(({ feature, featurekit, launchdarkly, optimizely }) => (
                <tr key={feature} className="hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4 text-gray-300 font-medium">{feature}</td>
                  <td className="px-6 py-4 text-center text-violet-300 font-medium">{featurekit}</td>
                  <td className="px-6 py-4 text-center text-gray-400">{launchdarkly}</td>
                  <td className="px-6 py-4 text-center text-gray-400">{optimizely}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Up and running in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-violet-900/50 border border-violet-700/40 rounded-2xl flex items-center justify-center text-violet-400 font-bold text-lg mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Simple, honest pricing</h2>
          <p className="text-gray-400">No hidden fees. No usage-based surprises. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(({ name, price, desc, features, cta, highlighted }) => (
            <div
              key={name}
              className={`p-6 rounded-2xl border ${
                highlighted
                  ? 'bg-violet-900/20 border-violet-600 ring-1 ring-violet-600/50'
                  : 'bg-gray-900 border-gray-800'
              }`}
            >
              {highlighted && (
                <div className="text-xs font-semibold text-violet-400 bg-violet-900/40 border border-violet-700/40 rounded-full px-3 py-1 inline-block mb-3">
                  ⭐ Most Popular
                </div>
              )}
              <div className="text-lg font-bold text-white mb-1">{name}</div>
              <div className="text-3xl font-bold text-white mb-1">{price}</div>
              <div className="text-sm text-gray-400 mb-5">{desc}</div>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-violet-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition ${
                  highlighted
                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/pricing" className="text-sm text-violet-400 hover:text-violet-300 transition">
            See full pricing comparison →
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Loved by indie devs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, author, role }) => (
              <div key={author} className="p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                <div className="text-yellow-400 text-sm mb-3">★★★★★</div>
                <blockquote className="text-gray-300 text-sm mb-4 leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div className="text-sm font-semibold text-white">{author}</div>
                <div className="text-xs text-gray-500">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-700/40 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Start shipping smarter today</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Free plan, no credit card required. Up and running in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl transition"
          >
            Start Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-violet-400 font-bold">
              ⚡ FeatureKit
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition">Features</a>
              <Link href="/pricing" className="hover:text-white transition">Pricing</Link>
              <a href="#" className="hover:text-white transition">Docs</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
            </div>
            <div className="text-sm text-gray-600">
              © FeatureKit 2026. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
