import React from 'react';
import type { FeatureGateProps } from './types';
/**
 * Conditionally renders children based on a feature flag.
 *
 * @example
 * <FeatureGate flag="new-checkout" fallback={<OldCheckout />}>
 *   <NewCheckout />
 * </FeatureGate>
 */
export declare function FeatureGate({ flag, fallback, children, }: FeatureGateProps): React.ReactElement;
