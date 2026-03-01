import React from 'react';
import type { FeatureKitContextValue, FeatureKitProviderProps } from './types';
export declare function FeatureKitProvider({ apiKey, baseUrl, user, children, }: FeatureKitProviderProps): React.ReactElement;
export declare function useFeatureKitContext(): FeatureKitContextValue;
