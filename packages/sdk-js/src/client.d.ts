import type { ClientOptions, FlagValue, UserContext } from './types';
export declare class FeatureKitClient {
    private apiKey;
    private baseUrl;
    private user;
    private flagsCache;
    private initPromise;
    constructor(options: ClientOptions);
    private _loadFlags;
    private _fetchAndEvaluate;
    /** Get all evaluated flags (cached 5 min) */
    getFlags(): Promise<Record<string, FlagValue>>;
    /** Check if a boolean flag is enabled */
    isEnabled(flagKey: string): Promise<boolean>;
    /** Get a flag's value (returns enabled as boolean for boolean flags) */
    getValue(flagKey: string, defaultValue?: FlagValue): Promise<FlagValue>;
    /** Get A/B test variant for a flag */
    getVariant(flagKey: string): Promise<string | null>;
    /** Update the user context (clears cache so next request uses new context) */
    identify(user: UserContext): void;
    /** Clear the evaluation cache */
    clearCache(): void;
}
