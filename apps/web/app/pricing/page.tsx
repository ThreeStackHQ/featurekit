'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Minus } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    desc: 'For side projects & experimentation',
    features: ['5 flags', '1 project', 'JS SDK only', 'Community support'],
    highlighted: false,
  },
  {
    id: 'indie',
    name: 'Indie',
    monthlyPrice: 9,
    annualPrice: 86,
    desc: 'For solo founders shipping fast',
    features: ['Unlimited flags', '3 projects', 'All SDKs (JS, React, Python)', 'A/B testing (basic)', 'Email support'],
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 29,
    annualPrice: 278,
    desc: 'For small teams moving faster',
    features: ['Unlimited everything', '10 projects', 'Advanced A/B testing', 'Targeting rules', '5 team seats', 'Priority support', 'SLA guarantee'],
    highlighted: false,
  },
];

type CellValue = '✅' | '❌' | string;

const COMPARISON_ROWS: { label: string; free: CellValue; indie: CellValue; team: CellValue }[] = [
  { label: 'Flags limit', free: '5', indie: 'Unlimited', team: 'Unlimited' },
  { label: 'Projects', free: '1', indie: '3', team: '10' },
  { label: 'SDK access', free: 'JS only', indie: 'JS, React, Python', team: 'JS, React, Python' },
  { label: 'A/B testing', free: '❌', indie: 'Basic', team: 'Advanced' },
  { label: 'Targeting rules', free: '❌', indie: '✅', team: '✅' },
  { label: 'Team seats', free: '1', indie: '1', team: '5' },
  { label: 'API calls/mo', free: '10K', indie: '500K', team: 'Unlimited' },
  { label: 'Analytics', free: 'Basic', indie: '✅', team: '✅' },
  { label: 'CSV export', free: '❌', indie: '✅', team: '✅' },
  { label: 'Webhooks', free: '❌', indie: '❌', team: '✅' },
  { label: 'Priority support', free: '❌', indie: '❌', team: '✅' },
  { label: 'SLA', free: '❌', indie: '❌', team: '99.9% uptime' },
];

const FAQS = [
  {
    q: 'How does this compare to LaunchDarkly?',
    a: "LaunchDarkly starts at $500+/month for teams. FeatureKit gives you the same core features — flags, targeting rules, A/B testing, kill switches — at a fraction of the price. We focus on what indie devs and small teams actually use.",
  },
  {
    q: 'Is there a free trial?',
    a: 'We have a Free tier that\'s free forever — no credit card required. You get 5 flags and 1 project to try everything out. Upgrade whenever you\'re ready.',
  },
  {
    q: 'Which SDK languages are supported?',
    a: 'Currently JS, React, and Python. We\'re adding Go, Ruby, and PHP next. All SDKs are under 2KB gzipped and support edge caching.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, cancel anytime from your billing settings. You keep access until the end of your current billing period. No questions asked.',
  },
  {
    q: 'Do you have A/B testing on the Free plan?',
    a: 'A/B testing is available on Indie (basic: 2-variant experiments) and Team (advanced: multi-variant, statistical significance calculator). The Free plan supports simple on/off flags only.',
  },
];

function renderCell(value: CellValue) {
  if (value === '✅') return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === '❌') return <Minus className="w-4 h-4 text-gray-600 mx-auto" />;
  return <span className="text-gray-300">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-violet-400">
            ⚡ FeatureKit
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="/#features" className="hover:text-white transition">Features</a>
            <Link href="/pricing" className="text-white font-medium">Pricing</Link>
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

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            No hidden fees. No per-seat gotchas. Cancel anytime.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm ${!annual ? 'text-white font-medium' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
              annual ? 'bg-violet-600' : 'bg-gray-600'
            }`}
            role="switch"
            aria-checked={annual}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                annual ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm flex items-center gap-2 ${annual ? 'text-white font-medium' : 'text-gray-400'}`}>
            Annual
            {annual && (
              <span className="text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
                Save 20%
              </span>
            )}
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PLANS.map(({ id, name, monthlyPrice, annualPrice, desc, features, highlighted }) => {
            const price = annual ? annualPrice : monthlyPrice;
            const suffix = price === 0 ? 'forever' : annual ? '/yr' : '/mo';
            return (
              <div
                key={id}
                className={`p-6 rounded-2xl border flex flex-col ${
                  highlighted
                    ? 'bg-violet-900/20 border-violet-600 ring-1 ring-violet-600/50 relative'
                    : 'bg-gray-900 border-gray-800'
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-semibold text-violet-400 bg-gray-900 border border-violet-600 rounded-full px-3 py-1">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <div className="text-lg font-bold text-white mb-1">{name}</div>
                  <div className="text-sm text-gray-400 mb-4">{desc}</div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">${price}</span>
                    <span className="text-gray-400 text-sm mb-1">{suffix}</span>
                  </div>
                  {annual && price > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      (${Math.round(price / 12)}/mo billed annually)
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                      {f}
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
                  {price === 0 ? 'Start Free' : `Get ${name}`}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Full feature comparison</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-500 font-medium">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-400 font-medium">Free</th>
                  <th className="px-6 py-4 text-center font-medium">
                    <span className="text-violet-400">Indie</span>
                  </th>
                  <th className="px-6 py-4 text-center text-gray-400 font-medium">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {COMPARISON_ROWS.map(({ label, free, indie, team }) => (
                  <tr key={label} className="hover:bg-gray-800/30 transition">
                    <td className="px-6 py-4 text-gray-300">{label}</td>
                    <td className="px-6 py-4 text-center text-sm">{renderCell(free)}</td>
                    <td className="px-6 py-4 text-center text-sm bg-violet-900/5">{renderCell(indie)}</td>
                    <td className="px-6 py-4 text-center text-sm">{renderCell(team)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-white hover:text-violet-300 transition"
                >
                  {q}
                  <span className={`text-gray-400 ml-4 flex-shrink-0 transition ${openFaq === idx ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-gray-400 leading-relaxed">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-violet-900/40 to-violet-800/20 border border-violet-700/40 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to ship smarter?</h2>
          <p className="text-gray-400 mb-8">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl transition"
          >
            Start Free →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-violet-400 font-bold">
              ⚡ FeatureKit
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="/#features" className="hover:text-white transition">Features</a>
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
