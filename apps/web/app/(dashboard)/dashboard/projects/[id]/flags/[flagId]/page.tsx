'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, ArrowLeft, Plus, X, Save } from 'lucide-react';

interface TargetingRule {
  attribute: string;
  operator: string;
  value: string;
}

interface FlagData {
  id: string;
  name: string;
  key: string;
  description: string | null;
  enabled: boolean;
  rolloutPercentage: number;
  targetingRules: TargetingRule[];
}

const SDK_TABS = ['JS', 'React', 'Python'] as const;
type SdkTab = (typeof SDK_TABS)[number];

function getSnippet(tab: SdkTab, flagKey: string): string {
  if (tab === 'JS') {
    return `import { createClient } from '@featurekit/sdk';

const client = createClient('pk_live_...');

const enabled = await client.isEnabled('${flagKey}', {
  userId: ctx.userId,
});`;
  }
  if (tab === 'React') {
    return `import { useFlag } from '@featurekit/sdk-react';

function MyComponent() {
  const enabled = useFlag('${flagKey}');

  if (enabled) {
    return <NewFeature />;
  }

  return <OldFeature />;
}`;
  }
  return `from featurekit import FeatureKit

fk = FeatureKit('pk_live_...')

enabled = fk.is_enabled('${flagKey}',
  user_id=user.id,
)`;
}

const RULE_ATTRIBUTES = [
  { value: 'userId', label: 'User ID' },
  { value: 'email', label: 'Email' },
  { value: 'country', label: 'Country' },
  { value: 'percentage', label: 'Percentage Rollout' },
];

const RULE_OPERATORS: Record<string, { value: string; label: string }[]> = {
  userId: [
    { value: 'IN', label: 'is in' },
    { value: 'NOT_IN', label: 'is not in' },
    { value: 'IS', label: 'is' },
  ],
  email: [
    { value: 'CONTAINS', label: 'contains' },
    { value: 'NOT_CONTAINS', label: 'does not contain' },
    { value: 'IS', label: 'is' },
  ],
  country: [
    { value: 'IS', label: 'is' },
    { value: 'IS_NOT', label: 'is not' },
  ],
  percentage: [
    { value: 'LT', label: '< (less than)' },
    { value: 'GT', label: '> (greater than)' },
  ],
};

export default function FlagDetailPage({ params }: { params: { id: string; flagId: string } }) {
  const router = useRouter();
  const [flag, setFlag] = useState<FlagData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [rollout, setRollout] = useState(0);
  const [rules, setRules] = useState<TargetingRule[]>([]);

  // New rule builder
  const [ruleAttr, setRuleAttr] = useState('userId');
  const [ruleOp, setRuleOp] = useState('IN');
  const [ruleVal, setRuleVal] = useState('');

  // SDK panel
  const [sdkTab, setSdkTab] = useState<SdkTab>('JS');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${params.id}/flags/${params.flagId}`)
      .then((r) => r.json())
      .then((data: FlagData) => {
        setFlag(data);
        setName(data.name);
        setDescription(data.description ?? '');
        setEnabled(data.enabled);
        setRollout(data.rolloutPercentage);
        setRules(Array.isArray(data.targetingRules) ? (data.targetingRules as TargetingRule[]) : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load flag');
        setLoading(false);
      });
  }, [params.id, params.flagId]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${params.id}/flags/${params.flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
          enabled,
          rolloutPercentage: rollout,
          targetingRules: rules,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to save');
        return;
      }
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const addRule = () => {
    if (!ruleVal.trim()) return;
    setRules((prev) => [
      ...prev,
      { attribute: ruleAttr, operator: ruleOp, value: ruleVal.trim() },
    ]);
    setRuleVal('');
  };

  const removeRule = (idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const copySnippet = () => {
    if (!flag) return;
    navigator.clipboard.writeText(getSnippet(sdkTab, flag.key));
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!flag) {
    return (
      <div className="p-6">
        <div className="text-red-400">{error || 'Flag not found'}</div>
      </div>
    );
  }

  const operators = RULE_OPERATORS[ruleAttr] ?? RULE_OPERATORS.userId;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/dashboard/projects" className="hover:text-gray-300 transition">Projects</Link>
            <span>/</span>
            <Link href={`/dashboard/projects/${params.id}`} className="hover:text-gray-300 transition">Project</Link>
            <span>/</span>
            <Link href={`/dashboard/projects/${params.id}/flags`} className="hover:text-gray-300 transition">Flags</Link>
            <span>/</span>
            <span className="text-gray-300">{flag.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{flag.name}</h1>
            <code className="text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded font-mono text-violet-300">
              {flag.key}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${params.id}/flags`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
          >
            {savedOk ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : savedOk ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-semibold text-white">Flag Settings</h2>

            {/* Kill switch */}
            <div className="flex items-center justify-between p-4 bg-gray-800/60 rounded-xl border border-gray-700">
              <div>
                <div className="text-sm font-medium text-white">Kill Switch</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {enabled ? 'Flag is enabled — serving to users' : 'Flag is disabled — hidden for everyone'}
                </div>
              </div>
              <button
                onClick={() => setEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                  enabled ? 'bg-violet-600' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={enabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition resize-none"
              />
            </div>

            {/* Rollout */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-400">Rollout Percentage</label>
                <span className="text-sm font-mono text-violet-400 font-semibold">{rollout}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rollout}
                onChange={(e) => setRollout(Number(e.target.value))}
                className="w-full accent-violet-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Targeting Rules */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Targeting Rules</h2>
            <p className="text-xs text-gray-500">
              Rules are evaluated in order. A user matching any rule will be served the flag.
            </p>

            {/* Rule builder */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={ruleAttr}
                onChange={(e) => {
                  setRuleAttr(e.target.value);
                  setRuleOp(RULE_OPERATORS[e.target.value]?.[0]?.value ?? 'IS');
                }}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
              >
                {RULE_ATTRIBUTES.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>

              <select
                value={ruleOp}
                onChange={(e) => setRuleOp(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
              >
                {operators.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              <input
                type="text"
                value={ruleVal}
                onChange={(e) => setRuleVal(e.target.value)}
                placeholder="Value..."
                onKeyDown={(e) => e.key === 'Enter' && addRule()}
                className="flex-1 min-w-[120px] bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
              />

              <button
                onClick={addRule}
                disabled={!ruleVal.trim()}
                className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            {/* Active rules */}
            {rules.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-violet-900/30 border border-violet-700/40 rounded-full text-sm text-violet-300"
                  >
                    <span className="font-medium">{rule.attribute}</span>
                    <span className="text-violet-400/60">{rule.operator}</span>
                    <span>"{rule.value}"</span>
                    <button
                      onClick={() => removeRule(idx)}
                      className="text-violet-400/60 hover:text-violet-300 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-600 py-2">
                No targeting rules yet. All users will match (respecting rollout %).
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3: SDK panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden sticky top-20">
            <div className="border-b border-gray-800 px-4 pt-4">
              <h2 className="text-sm font-semibold text-white mb-3">SDK Snippets</h2>
              <div className="flex gap-1">
                {SDK_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSdkTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition ${
                      sdkTab === tab
                        ? 'text-violet-300 border-violet-500 bg-violet-900/20'
                        : 'text-gray-400 border-transparent hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative p-4">
              <button
                onClick={copySnippet}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition"
                title="Copy snippet"
              >
                {copiedSnippet ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap pr-8">
                {getSnippet(sdkTab, flag.key)}
              </pre>
            </div>

            <div className="border-t border-gray-800 px-4 py-3">
              <p className="text-xs text-gray-500">
                Install:{' '}
                <code className="text-violet-400 font-mono">npm i @featurekit/sdk</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
