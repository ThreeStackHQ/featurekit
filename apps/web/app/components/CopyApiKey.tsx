'use client';

import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

interface Props {
  apiKey: string;
  maskedKey: string;
}

export default function CopyApiKey({ apiKey, maskedKey }: Props) {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm font-mono text-gray-200 truncate">
        {visible ? apiKey : maskedKey}
      </code>
      <button
        onClick={() => setVisible((v) => !v)}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        title={visible ? 'Hide key' : 'Show key'}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        onClick={handleCopy}
        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
        title="Copy API key"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
