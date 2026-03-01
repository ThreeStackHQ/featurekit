import React from 'react';
import { useFeatureKitContext } from './context';
import type { FeatureGateProps } from './types';

/**
 * Conditionally renders children based on a feature flag.
 *
 * @example
 * <FeatureGate flag="new-checkout" fallback={<OldCheckout />}>
 *   <NewCheckout />
 * </FeatureGate>
 */
export function FeatureGate({
  flag,
  fallback = null,
  children,
}: FeatureGateProps): React.ReactElement {
  const { flags, loading } = useFeatureKitContext();

  if (loading) {
    // While loading, render the fallback to avoid layout shift
    return React.createElement(React.Fragment, null, fallback);
  }

  const enabled = flags[flag] === true;

  return React.createElement(
    React.Fragment,
    null,
    enabled ? children : fallback
  );
}
