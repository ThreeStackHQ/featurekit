import { useFeatureKitContext } from './context';
import type { FeatureKitContextValue, FlagValue, UserContext } from './types';

/**
 * Returns whether a boolean flag is enabled.
 * Returns `undefined` while flags are loading.
 */
export function useFlag(flagKey: string): boolean | undefined {
  const { flags, loading } = useFeatureKitContext();
  if (loading) return undefined;
  const val = flags[flagKey];
  return val === true || val === false ? val : Boolean(val);
}

/**
 * Returns the A/B variant for a flag.
 * Returns `undefined` while loading, `null` if no variant is assigned.
 */
export function useVariant(flagKey: string): string | null | undefined {
  const { flags, loading } = useFeatureKitContext();
  if (loading) return undefined;
  const val = flags[flagKey];
  if (typeof val === 'string') return val;
  return null;
}

/**
 * Returns the full FeatureKit context with all helpers.
 */
export function useFeatureKit(): Pick<
  FeatureKitContextValue,
  'flags' | 'loading' | 'error' | 'isEnabled' | 'getValue' | 'getVariant' | 'identify'
> {
  const { flags, loading, error, isEnabled, getValue, getVariant, identify } =
    useFeatureKitContext();
  return { flags, loading, error, isEnabled, getValue, getVariant, identify };
}

// Re-export types for consumers
export type { FlagValue, UserContext };
