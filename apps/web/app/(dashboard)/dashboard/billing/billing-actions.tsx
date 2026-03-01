'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingActions({ tier }: { tier: 'pro' | 'business' }) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setLoading(false);
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="mt-4 w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-medium rounded-lg transition text-sm"
    >
      {loading ? 'Loading...' : `Upgrade to ${tier}`}
    </button>
  );
}
