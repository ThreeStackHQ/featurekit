import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createClient, FeatureKitClient } from '@featurekit/sdk';
import type {
  FeatureKitContextValue,
  FeatureKitProviderProps,
  FlagValue,
  UserContext,
} from './types';

// ─── Context ──────────────────────────────────────────────────────────────────

const FeatureKitContext = createContext<FeatureKitContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FeatureKitProvider({
  apiKey,
  baseUrl,
  user,
  children,
}: FeatureKitProviderProps): React.ReactElement {
  const [flags, setFlags] = useState<Record<string, FlagValue>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Keep a stable ref to the client
  const clientRef = useRef<FeatureKitClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = createClient({ apiKey, baseUrl, user });
  }

  const loadFlags = useCallback(async (): Promise<void> => {
    if (!clientRef.current) return;
    try {
      setLoading(true);
      setError(null);
      const result = await clientRef.current.getFlags();
      setFlags(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, []);

  // Load flags on mount
  useEffect(() => {
    void loadFlags();
  }, [loadFlags]);

  // Re-load if user changes
  useEffect(() => {
    if (clientRef.current && user) {
      clientRef.current.identify(user);
      void loadFlags();
    }
  }, [user?.id, loadFlags]); // eslint-disable-line react-hooks/exhaustive-deps

  const isEnabled = useCallback(
    (flagKey: string): boolean => {
      const val = flags[flagKey];
      return val === true;
    },
    [flags]
  );

  const getValue = useCallback(
    (flagKey: string, defaultValue?: FlagValue): FlagValue => {
      const val = flags[flagKey];
      return val !== undefined ? val : (defaultValue ?? null);
    },
    [flags]
  );

  const getVariant = useCallback(
    (flagKey: string): string | null => {
      const val = flags[flagKey];
      if (typeof val === 'string') return val;
      return null;
    },
    [flags]
  );

  const identify = useCallback(
    (newUser: UserContext): void => {
      if (clientRef.current) {
        clientRef.current.identify(newUser);
        void loadFlags();
      }
    },
    [loadFlags]
  );

  const value: FeatureKitContextValue = {
    flags,
    loading,
    error,
    isEnabled,
    getValue,
    getVariant,
    identify,
  };

  return (
    <FeatureKitContext.Provider value={value}>
      {children}
    </FeatureKitContext.Provider>
  );
}

// ─── Hook: raw context ─────────────────────────────────────────────────────────

export function useFeatureKitContext(): FeatureKitContextValue {
  const ctx = useContext(FeatureKitContext);
  if (!ctx) {
    throw new Error(
      'FeatureKit: useFeatureKitContext must be used inside <FeatureKitProvider>'
    );
  }
  return ctx;
}
