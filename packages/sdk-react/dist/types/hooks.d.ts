import type { FeatureKitContextValue, FlagValue, UserContext } from './types';
/**
 * Returns whether a boolean flag is enabled.
 * Returns `undefined` while flags are loading.
 */
export declare function useFlag(flagKey: string): boolean | undefined;
/**
 * Returns the A/B variant for a flag.
 * Returns `undefined` while loading, `null` if no variant is assigned.
 */
export declare function useVariant(flagKey: string): string | null | undefined;
/**
 * Returns the full FeatureKit context with all helpers.
 */
export declare function useFeatureKit(): Pick<FeatureKitContextValue, 'flags' | 'loading' | 'error' | 'isEnabled' | 'getValue' | 'getVariant' | 'identify'>;
export type { FlagValue, UserContext };
