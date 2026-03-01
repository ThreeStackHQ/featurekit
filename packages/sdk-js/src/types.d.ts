export type FlagValuePrimitive = boolean | string | number;
export type FlagValue = FlagValuePrimitive | Record<string, unknown> | null;
export interface UserContext {
    id: string;
    email?: string;
    attributes?: Record<string, unknown>;
}
export interface ClientOptions {
    apiKey: string;
    baseUrl?: string;
    user?: UserContext;
}
export interface EvalResult {
    enabled: boolean;
    variant?: string;
    reason: string;
}
export interface RawFlag {
    id: string;
    key: string;
    name: string;
    enabled: boolean;
    rolloutPercentage: number;
    targetingRules: TargetingRule[];
    variants: Variant[];
    isExperiment: boolean;
}
export interface TargetingRule {
    attribute: string;
    operator: 'IS' | 'IS_NOT' | 'CONTAINS' | 'NOT_CONTAINS' | 'IN' | 'NOT_IN' | 'GT' | 'LT';
    value: string | string[] | number;
}
export interface Variant {
    name: string;
    weight: number;
}
export interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}
