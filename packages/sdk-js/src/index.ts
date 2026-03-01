export { FeatureKitClient } from './client';
export type { ClientOptions, FlagValue, UserContext, EvalResult } from './types';

import { FeatureKitClient } from './client';
import type { ClientOptions } from './types';

/**
 * Create a FeatureKit client instance.
 *
 * Browser:
 *   const client = FeatureKit.createClient({ apiKey: 'fk_live_...', user: { id: 'user123' } })
 *
 * NPM/ESM:
 *   import { createClient } from '@featurekit/sdk'
 *   const client = createClient({ apiKey: 'fk_live_...' })
 */
export function createClient(options: ClientOptions): FeatureKitClient {
  return new FeatureKitClient(options);
}
