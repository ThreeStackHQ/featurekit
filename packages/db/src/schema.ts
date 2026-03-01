import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Projects ────────────────────────────────────────────────────────────────
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  apiKey: text('api_key').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ─── Flags ───────────────────────────────────────────────────────────────────
export type FlagType = 'boolean' | 'string' | 'number' | 'json' | 'ab_test';

export const flags = pgTable('flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  key: text('key').notNull(),
  description: text('description'),
  type: text('type').$type<FlagType>().notNull().default('boolean'),
  enabled: boolean('enabled').notNull().default(false),
  rolloutPercentage: integer('rollout_percentage').notNull().default(0),
  targetingRules: jsonb('targeting_rules').notNull().$type<TargetingRule[]>().default([]),
  variants: jsonb('variants').notNull().$type<Variant[]>().default([]),
  isExperiment: boolean('is_experiment').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Flag Evaluations ─────────────────────────────────────────────────────────
export const flagEvaluations = pgTable('flag_evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  flagId: uuid('flag_id').notNull().references(() => flags.id, { onDelete: 'cascade' }),
  endUserId: text('end_user_id'),
  variant: text('variant'),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  tier: text('tier').notNull().default('free'),
  status: text('status').notNull().default('active'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many, one }) => ({
  projects: many(projects),
  subscription: one(subscriptions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  flags: many(flags),
}));

export const flagsRelations = relations(flags, ({ one, many }) => ({
  project: one(projects, { fields: [flags.projectId], references: [projects.id] }),
  evaluations: many(flagEvaluations),
}));

// ─── Types ───────────────────────────────────────────────────────────────────
export interface TargetingRule {
  attribute: string;
  operator: 'IS' | 'IS_NOT' | 'CONTAINS' | 'NOT_CONTAINS' | 'IN' | 'NOT_IN' | 'GT' | 'LT';
  value: string | string[] | number;
}

export interface Variant {
  name: string;
  weight: number; // 0-100, all variants should sum to 100
}

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Flag = typeof flags.$inferSelect;
export type NewFlag = typeof flags.$inferInsert;
export type FlagEvaluation = typeof flagEvaluations.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
