import { platformBillingService } from './platformBilling';
import { mockPlatformBillingService } from './platformBilling.mock';

// Match DEV_MODE flag from stripeService.ts
const DEV_MODE = false;

export const platformBilling = DEV_MODE ? mockPlatformBillingService : platformBillingService;

export type { PlatformBillingService } from './platformBilling';
