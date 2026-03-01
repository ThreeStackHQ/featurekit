import { jsx } from 'react/jsx-runtime';
import React, { createContext, useState, useRef, useCallback, useEffect, useContext } from 'react';
import { createClient } from '@featurekit/sdk';

// ─── Context ──────────────────────────────────────────────────────────────────
const FeatureKitContext = createContext(null);
// ─── Provider ─────────────────────────────────────────────────────────────────
function FeatureKitProvider({ apiKey, baseUrl, user, children, }) {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Keep a stable ref to the client
    const clientRef = useRef(null);
    if (!clientRef.current) {
        clientRef.current = createClient({ apiKey, baseUrl, user });
    }
    const loadFlags = useCallback(async () => {
        if (!clientRef.current)
            return;
        try {
            setLoading(true);
            setError(null);
            const result = await clientRef.current.getFlags();
            setFlags(result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error(String(err)));
        }
        finally {
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
    }, [user === null || user === void 0 ? void 0 : user.id, loadFlags]); // eslint-disable-line react-hooks/exhaustive-deps
    const isEnabled = useCallback((flagKey) => {
        const val = flags[flagKey];
        return val === true;
    }, [flags]);
    const getValue = useCallback((flagKey, defaultValue) => {
        const val = flags[flagKey];
        return val !== undefined ? val : (defaultValue !== null && defaultValue !== void 0 ? defaultValue : null);
    }, [flags]);
    const getVariant = useCallback((flagKey) => {
        const val = flags[flagKey];
        if (typeof val === 'string')
            return val;
        return null;
    }, [flags]);
    const identify = useCallback((newUser) => {
        if (clientRef.current) {
            clientRef.current.identify(newUser);
            void loadFlags();
        }
    }, [loadFlags]);
    const value = {
        flags,
        loading,
        error,
        isEnabled,
        getValue,
        getVariant,
        identify,
    };
    return (jsx(FeatureKitContext.Provider, { value: value, children: children }));
}
// ─── Hook: raw context ─────────────────────────────────────────────────────────
function useFeatureKitContext() {
    const ctx = useContext(FeatureKitContext);
    if (!ctx) {
        throw new Error('FeatureKit: useFeatureKitContext must be used inside <FeatureKitProvider>');
    }
    return ctx;
}

/**
 * Returns whether a boolean flag is enabled.
 * Returns `undefined` while flags are loading.
 */
function useFlag(flagKey) {
    const { flags, loading } = useFeatureKitContext();
    if (loading)
        return undefined;
    const val = flags[flagKey];
    return val === true || val === false ? val : Boolean(val);
}
/**
 * Returns the A/B variant for a flag.
 * Returns `undefined` while loading, `null` if no variant is assigned.
 */
function useVariant(flagKey) {
    const { flags, loading } = useFeatureKitContext();
    if (loading)
        return undefined;
    const val = flags[flagKey];
    if (typeof val === 'string')
        return val;
    return null;
}
/**
 * Returns the full FeatureKit context with all helpers.
 */
function useFeatureKit() {
    const { flags, loading, error, isEnabled, getValue, getVariant, identify } = useFeatureKitContext();
    return { flags, loading, error, isEnabled, getValue, getVariant, identify };
}

/**
 * Conditionally renders children based on a feature flag.
 *
 * @example
 * <FeatureGate flag="new-checkout" fallback={<OldCheckout />}>
 *   <NewCheckout />
 * </FeatureGate>
 */
function FeatureGate({ flag, fallback = null, children, }) {
    const { flags, loading } = useFeatureKitContext();
    if (loading) {
        // While loading, render the fallback to avoid layout shift
        return React.createElement(React.Fragment, null, fallback);
    }
    const enabled = flags[flag] === true;
    return React.createElement(React.Fragment, null, enabled ? children : fallback);
}

export { FeatureGate, FeatureKitProvider, useFeatureKit, useFlag, useVariant };
//# sourceMappingURL=index.js.map
