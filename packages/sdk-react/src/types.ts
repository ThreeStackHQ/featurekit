import type { ClientOptions, FlagValue, UserContext } from '@featurekit/sdk';

export type { FlagValue, UserContext };

export interface FeatureKitContextValue {
  flags: Record<string, FlagValue>;
  loading: boolean;
  error: Error | null;
  isEnabled: (flagKey: string) => boolean;
  getValue: (flagKey: string, defaultValue?: FlagValue) => FlagValue;
  getVariant: (flagKey: string) => string | null;
  identify: (user: UserContext) => void;
}

export interface FeatureKitProviderProps {
  apiKey: string;
  baseUrl?: string;
  user?: UserContext;
  children: React.ReactNode;
}

export interface FeatureGateProps {
  flag: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export type { ClientOptions };
