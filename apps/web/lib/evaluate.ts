import type { Flag, TargetingRule, Variant } from '@featurekit/db';
import crypto from 'crypto';

export interface EvalContext {
  userId?: string;
  email?: string;
  country?: string;
  [key: string]: string | number | boolean | undefined;
}

function consistentHash(input: string): number {
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return parseInt(hash.slice(0, 8), 16) % 100;
}

function evaluateRule(rule: TargetingRule, context: EvalContext): boolean {
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

export interface EvalResult {
  enabled: boolean;
  variant?: string;
  reason: 'disabled' | 'targeting_matched' | 'rollout' | 'targeting_unmatched';
}

export function evaluateFlag(flag: Flag, context: EvalContext): EvalResult {
  // If flag is globally disabled, short-circuit
  if (!flag.enabled) {
    return { enabled: false, reason: 'disabled' };
  }

  const rules = (flag.targetingRules as TargetingRule[]) || [];
  const variants = (flag.variants as Variant[]) || [];
  const userId = context.userId || '';
  const hashInput = `${userId}:${flag.key}`;
  const hashValue = consistentHash(hashInput);

  // Check targeting rules (if any rules, ALL must pass)
  if (rules.length > 0) {
    const allMatch = rules.every((rule) => evaluateRule(rule, context));
    if (allMatch) {
      const variant = flag.isExperiment ? selectVariant(variants, hashValue) : undefined;
      return { enabled: true, variant, reason: 'targeting_matched' };
    } else {
      // Rules exist but didn't match — check if there's a rollout for non-targeted users
      if (flag.rolloutPercentage === 0) {
        return { enabled: false, reason: 'targeting_unmatched' };
      }
    }
  }

  // Percentage rollout
  if (hashValue < flag.rolloutPercentage) {
    const variant = flag.isExperiment ? selectVariant(variants, hashValue) : undefined;
    return { enabled: true, variant, reason: 'rollout' };
  }

  return { enabled: false, reason: 'rollout' };
}
