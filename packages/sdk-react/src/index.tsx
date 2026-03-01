// ─── Provider & Context ───────────────────────────────────────────────────────
export { FeatureKitProvider } from './context';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useFlag, useVariant, useFeatureKit } from './hooks';

// ─── Components ───────────────────────────────────────────────────────────────
export { FeatureGate } from './FeatureGate';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  FeatureKitContextValue,
  FeatureKitProviderProps,
  FeatureGateProps,
  FlagValue,
  UserContext,
} from './types';
