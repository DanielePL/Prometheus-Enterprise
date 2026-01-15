import { stripeService } from './stripe';
import { mockStripeService } from './stripe.mock';

// Check if we're in DEV_MODE by looking at the environment
// This matches the DEV_MODE flag in AuthContext.tsx
const DEV_MODE = false; // Set to true for local development without Stripe

// Export the appropriate service based on mode
export const stripe = DEV_MODE ? mockStripeService : stripeService;

// Re-export types
export type { StripeConnectionStatus, CreateSubscriptionResult, CreatePaymentResult } from './stripe';
