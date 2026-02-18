import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link2, CheckCircle, XCircle } from 'lucide-react';

interface CoachLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coachName: string;
  coachEmail: string;
  onLink: (email: string) => Promise<{ success: boolean; message?: string }>;
}

export default function CoachLinkDialog({
  open,
  onOpenChange,
  coachName,
  coachEmail,
  onLink,
}: CoachLinkDialogProps) {
  const [email, setEmail] = useState(coachEmail);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await onLink(email.trim());
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          onOpenChange(false);
          setResult(null);
        }, 2000);
      }
    } catch (error) {
      setResult({ success: false, message: 'An error occurred while linking' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); setResult(null); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Link to Prometheus Coach
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Enter the email address that <strong>{coachName}</strong> uses in the
            Prometheus Coach app. This will link their coaching data to this profile.
          </p>

          <div className="space-y-2">
            <Label htmlFor="coachEmail">Coach App Email</Label>
            <Input
              id="coachEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="coach@example.com"
              required
            />
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              result.success
                ? 'bg-green-500/10 text-green-500'
                : 'bg-destructive/10 text-destructive'
            }`}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span className="text-sm">
                {result.success
                  ? 'Successfully linked!'
                  : result.message || 'No account found with this email'}
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 mr-2" />
                  Link Account
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
