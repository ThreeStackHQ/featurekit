'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Edit, Flag } from 'lucide-react';
import CreateFlagModal from './CreateFlagModal';
import type { Flag as FlagType } from '@featurekit/db';

interface Props {
  flags: FlagType[];
  projectId: string;
}

export default function FlagsClient({ flags, projectId }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query) return flags;
    const q = query.toLowerCase();
    return flags.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q)
    );
  }, [flags, query]);

  const handleToggle = async (flag: FlagType) => {
    setTogglingId(flag.id);
    try {
      await fetch(`/api/projects/${projectId}/flags/${flag.id}/toggle`, {
        method: 'POST',
      });
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  };

  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <Flag className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No flags yet</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Create your first feature flag to start rolling out features safely.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Create Flag
        </button>
        {showModal && (
          <CreateFlagModal projectId={projectId} onClose={() => setShowModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Flag
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Key</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Rollout</th>
              <th className="text-left px-4 py-3 font-medium">Rules</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No flags match your search
                </td>
              </tr>
            ) : (
              filtered.map((flag) => {
                const rules = Array.isArray(flag.targetingRules) ? flag.targetingRules : [];
                return (
                  <tr key={flag.id} className="hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{flag.name}</div>
                      {flag.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{flag.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-800 border border-gray-700 px-2 py-0.5 rounded text-violet-300 font-mono">
                        {flag.key}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(flag)}
                        disabled={togglingId === flag.id}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          flag.enabled ? 'bg-violet-600' : 'bg-gray-600'
                        } disabled:opacity-50`}
                        role="switch"
                        aria-checked={flag.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                            flag.enabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full max-w-[80px]">
                          <div
                            className="h-1.5 bg-violet-500 rounded-full"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{flag.rolloutPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {rules.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-violet-900/40 text-violet-300 border border-violet-700/40">
                          {rules.length} rule{rules.length !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/dashboard/projects/${projectId}/flags/${flag.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg transition"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateFlagModal projectId={projectId} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
