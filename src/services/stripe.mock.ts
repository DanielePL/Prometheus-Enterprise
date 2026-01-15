import type { StripeSubscription } from '@/types/database';
import type { StripeConnectionStatus, CreateSubscriptionResult, CreatePaymentResult } from './stripe';

/**
 * Mock Stripe service for DEV_MODE
 * Simulates Stripe Connect functionality without actual API calls
 */
export const mockStripeService = {
  async getConnectionStatus(): Promise<StripeConnectionStatus> {
    // In DEV_MODE, simulate a disconnected state by default
    // You can change this to 'connected' to test connected UI
    return {
      isConnected: false,
      accountId: null,
      connectedAt: null,
      status: 'disconnected',
    };
  },

  async initiateConnect(): Promise<string> {
    return '#dev-mode-stripe-connect';
  },

  async disconnect(): Promise<void> {
    // No-op in DEV_MODE
  },

  async createSubscription(
    _memberId: string,
    _priceId: string
  ): Promise<CreateSubscriptionResult> {
    return {
      subscriptionId: `sub_mock_${Date.now()}`,
      clientSecret: `pi_mock_secret_${Date.now()}`,
    };
  },

  async cancelSubscription(_subscriptionId: string): Promise<void> {
    // No-op in DEV_MODE
  },

  async getMemberSubscriptions(): Promise<StripeSubscription[]> {
    // Return empty array in DEV_MODE
    return [];
  },

  async getGymSubscriptions(): Promise<StripeSubscription[]> {
    // Return empty array in DEV_MODE
    return [];
  },

  async createPayment(
    _memberId: string,
    _amount: number,
    _description: string
  ): Promise<CreatePaymentResult> {
    return {
      paymentIntentId: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_secret_${Date.now()}`,
    };
  },

  async getDashboardLink(): Promise<string> {
    return 'https://dashboard.stripe.com';
  },

  async syncSubscription(_subscriptionId: string): Promise<void> {
    // No-op in DEV_MODE
  },
};
