import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink, AlertTriangle, Unlink } from 'lucide-react';
import { StripeConnectButton } from './StripeConnectButton';
import { stripe, StripeConnectionStatus } from '@/services/stripeService';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StripeConnectionCardProps {
  status: StripeConnectionStatus;
  gymId: string;
  onStatusChange: () => void;
}

export function StripeConnectionCard({
  status,
  gymId,
  onStatusChange,
}: StripeConnectionCardProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  const handleOpenDashboard = async () => {
    try {
      const url = await stripe.getDashboardLink(gymId);
      window.open(url, '_blank');
    } catch (error) {
      toast.error('Failed to open Stripe dashboard');
      console.error(error);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await stripe.disconnect(gymId);
      toast.success('Stripe account disconnected');
      onStatusChange();
    } catch (error) {
      toast.error('Failed to disconnect Stripe account');
      console.error(error);
    } finally {
      setDisconnecting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'connected':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
            Connected
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
            Pending
          </Badge>
        );
      case 'restricted':
        return (
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">
            Restricted
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Stripe Payments</CardTitle>
              <CardDescription>
                Accept payments from your members via Stripe
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.isConnected ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Connect your Stripe account to accept credit card payments, set up
              recurring subscriptions, and track all transactions in one place.
            </p>
            <div className="flex items-center gap-2">
              <StripeConnectButton
                isConnected={false}
                onConnect={onStatusChange}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {status.accountId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Connected</p>
                <p className="text-xs text-muted-foreground">
                  {status.connectedAt
                    ? new Date(status.connectedAt).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>
            </div>

            {status.status === 'restricted' && (
              <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/30">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Your Stripe account requires attention. Please complete the
                  verification process in the Stripe Dashboard.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDashboard}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Stripe Dashboard
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Stripe Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will disconnect your Stripe account from Prometheus
                      Enterprise. You will no longer be able to process payments
                      until you reconnect. Existing subscriptions will continue
                      to be managed in Stripe.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
