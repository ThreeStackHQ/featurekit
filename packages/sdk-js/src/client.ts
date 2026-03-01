import { Cache } from './cache';
import type {
  ClientOptions,
  EvalResult,
  FlagValue,
  RawFlag,
  TargetingRule,
  UserContext,
  Variant,
} from './types';

// ─── Consistent hash (deterministic, 0–99) ───────────────────────────────────
// Uses a djb2-based hash that is consistent per user+flag key combo.
function consistentHash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  return hash % 100;
}

// ─── Targeting rule evaluator ─────────────────────────────────────────────────
type ContextValue = string | number | boolean | undefined;

function evaluateRule(
  rule: TargetingRule,
  context: Record<string, ContextValue>
): boolean {
  const ctxValue = context[rule.attribute];
  if (ctxValue === undefined) return false;
  const strValue = String(ctxValue);
  const ruleValue = rule.value;

  switch (rule.operator) {
    case 'IS':
      return strValue === String(ruleValue);
    case 'IS_NOT':
      return strValue !== String(ruleValue);
    case 'CONTAINS':
      return strValue.includes(String(ruleValue));
    case 'NOT_CONTAINS':
      return !strValue.includes(String(ruleValue));
    case 'IN':
      return Array.isArray(ruleValue) && ruleValue.map(String).includes(strValue);
    case 'NOT_IN':
      return Array.isArray(ruleValue) && !ruleValue.map(String).includes(strValue);
    case 'GT':
      return Number(ctxValue) > Number(ruleValue);
    case 'LT':
      return Number(ctxValue) < Number(ruleValue);
    default:
      return false;
  }
}

function selectVariant(variants: Variant[], hashValue: number): string | undefined {
  if (!variants || variants.length === 0) return undefined;
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (hashValue < cumulative) return variant.name;
  }
  return variants[variants.length - 1]?.name;
}

function evaluateFlag(
  flag: RawFlag,
  userId: string,
  context: Record<string, ContextValue>
): EvalResult {
  if (!flag.enabled) {
    return { enabled: false, reason: 'disabled' };
  }

  const rules = flag.targetingRules ?? [];
  const variants = flag.variants ?? [];
  const hashInput = `${userId}:${flag.key}`;
  const hashValue = consistentHash(hashInput);

  if (rules.length > 0) {
    const allMatch = rules.every((rule) => evaluateRule(rule, context));
    if (allMatch) {
      const variant = flag.isExperiment ? selectVariant(variants, hashValue) : undefined;
      return { enabled: true, variant, reason: 'targeting_matched' };
    } else {
      if (flag.rolloutPercentage === 0) {
        return { enabled: false, reason: 'targeting_unmatched' };
      }
    }
  }

  if (hashValue < flag.rolloutPercentage) {
    const variant = flag.isExperiment ? selectVariant(variants, hashValue) : undefined;
    return { enabled: true, variant, reason: 'rollout' };
  }

  return { enabled: false, reason: 'rollout' };
}

// ─── FeatureKitClient ─────────────────────────────────────────────────────────

const FLAGS_CACHE_KEY = '__all_flags__';

export class FeatureKitClient {
  private apiKey: string;
  private baseUrl: string;
  private user: UserContext | undefined;
  private flagsCache: Cache<Record<string, EvalResult>>;
  private initPromise: Promise<Record<string, EvalResult>> | null = null;

  constructor(options: ClientOptions) {
    if (!options.apiKey) {
      throw new Error('FeatureKit: apiKey is required');
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? '').replace(/\/$/, '');
    this.user = options.user;
    this.flagsCache = new Cache<Record<string, EvalResult>>();
  }

  // ── Internal: load all flags from server ────────────────────────────────────
  private async _loadFlags(): Promise<Record<string, EvalResult>> {
    const cached = this.flagsCache.get(FLAGS_CACHE_KEY);
    if (cached) return cached;

    // Deduplicate concurrent requests
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._fetchAndEvaluate().finally(() => {
      this.initPromise = null;
    });

    return this.initPromise;
  }

  private async _fetchAndEvaluate(): Promise<Record<string, EvalResult>> {
    const url = `${this.baseUrl}/api/sdk/flags`;
    const res = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`FeatureKit: flags fetch failed (${res.status})`);
    }

    const data = (await res.json()) as { flags: RawFlag[] };
    const userId = this.user?.id ?? '';
    const context: Record<string, ContextValue> = {
      userId,
      email: this.user?.email,
      ...this.user?.attributes,
    };

    const evaluated: Record<string, EvalResult> = {};
    for (const flag of data.flags) {
      evaluated[flag.key] = evaluateFlag(flag, userId, context);
    }

    this.flagsCache.set(FLAGS_CACHE_KEY, evaluated);
    return evaluated;
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Get all evaluated flags (cached 5 min) */
  async getFlags(): Promise<Record<string, FlagValue>> {
    const results = await this._loadFlags();
    const output: Record<string, FlagValue> = {};
    for (const [key, result] of Object.entries(results)) {
      output[key] = result.enabled;
    }
    return output;
  }

  /** Check if a boolean flag is enabled */
  async isEnabled(flagKey: string): Promise<boolean> {
    const results = await this._loadFlags();
    return results[flagKey]?.enabled ?? false;
  }

  /** Get a flag's value (returns enabled as boolean for boolean flags) */
  async getValue(flagKey: string, defaultValue?: FlagValue): Promise<FlagValue> {
    const results = await this._loadFlags();
    const result = results[flagKey];
    if (!result) return defaultValue ?? null;
    if (result.variant !== undefined) return result.variant;
    return result.enabled;
  }

  /** Get A/B test variant for a flag */
  async getVariant(flagKey: string): Promise<string | null> {
    const results = await this._loadFlags();
    const result = results[flagKey];
    if (!result || !result.enabled) return null;
    return result.variant ?? null;
  }

  /** Update the user context (clears cache so next request uses new context) */
  identify(user: UserContext): void {
    this.user = user;
    this.flagsCache.clear();
  }

  /** Clear the evaluation cache */
  clearCache(): void {
    this.flagsCache.clear();
  }
}
