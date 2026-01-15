import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, ExternalLink, Check } from 'lucide-react';
import { stripe } from '@/services/stripeService';
import { toast } from 'sonner';

interface StripeConnectButtonProps {
  isConnected: boolean;
  onConnect?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
}

export function StripeConnectButton({
  isConnected,
  onConnect,
  variant = 'default',
  size = 'default',
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await stripe.initiateConnect();
      if (url.startsWith('#')) {
        // DEV_MODE - show toast instead of redirect
        toast.info('DEV MODE: Stripe Connect OAuth would redirect here');
        onConnect?.();
      } else {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Failed to initiate Stripe connection');
      console.error('Stripe connect error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <Button variant="outline" size={size} className="gap-2 cursor-default" disabled>
        <Check className="h-4 w-4 text-green-500" />
        Connected
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      variant={variant}
      size={size}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      Connect with Stripe
    </Button>
  );
}
