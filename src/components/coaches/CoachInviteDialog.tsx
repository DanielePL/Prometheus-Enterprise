import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Copy,
  Mail,
  Link2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import type { Coach } from '@/types/database';
import type { CoachInvitation } from '@/types/coachInvitation';

interface CoachInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: Coach | null;
  gymId: string;
  gymName: string;
  userId: string;
}

// Lazy import to avoid circular deps — service may not exist yet during build
let _service: typeof import('@/services/coachInvitationService').coachInvitationService | null = null;
async function getService() {
  if (!_service) {
    const mod = await import('@/services/coachInvitationService');
    _service = mod.coachInvitationService;
  }
  return _service;
}

export default function CoachInviteDialog({
  open,
  onOpenChange,
  coach,
  gymId,
  gymName,
  userId,
}: CoachInviteDialogProps) {
  const queryClient = useQueryClient();
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Fetch existing invitations for this coach
  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['coach-invitations', coach?.id],
    queryFn: async () => {
      if (!coach) return [];
      const svc = await getService();
      return svc.getByCoach(coach.id);
    },
    enabled: open && !!coach,
  });

  // Generate new invitation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!coach) throw new Error('No coach selected');
      const svc = await getService();
      const invitation = await svc.create({
        gym_id: gymId,
        coach_id: coach.id,
        coach_name: coach.name,
        coach_email: coach.email,
        gym_name: gymName,
        created_by: userId,
      });
      const url = svc.getInviteUrl(invitation.token);
      return { invitation, url };
    },
    onSuccess: ({ url }) => {
      setGeneratedUrl(url);
      queryClient.invalidateQueries({ queryKey: ['coach-invitations', coach?.id] });
      toast.success('Invitation link generated');
    },
    onError: () => {
      toast.error('Failed to generate invitation link');
    },
  });

  // Revoke invitation
  const revokeMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const svc = await getService();
      await svc.revoke(invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coach-invitations', coach?.id] });
      toast.success('Invitation revoked');
    },
    onError: () => {
      toast.error('Failed to revoke invitation');
    },
  });

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleEmailShare = () => {
    if (!coach || !generatedUrl) return;
    const subject = encodeURIComponent(`Join ${gymName} on Prometheus Coach`);
    const body = encodeURIComponent(
      `Hi ${coach.name},\n\nYou've been invited to connect with ${gymName} on Prometheus Coach.\n\nClick the link below to accept:\n${generatedUrl}\n\nThis link expires in 7 days.\n\nBest regards,\n${gymName}`
    );
    window.open(`mailto:${coach.email}?subject=${subject}&body=${body}`);
  };

  const getStatusBadge = (invitation: CoachInvitation) => {
    switch (invitation.status) {
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'expired':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Revoked</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setGeneratedUrl(null); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Send Invite Link
          </DialogTitle>
          <DialogDescription>
            Generate an invitation link for {coach?.name} to connect their Prometheus Coach account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Generate Link Section */}
          {!generatedUrl ? (
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="h-4 w-4 mr-2" />
              )}
              Generate Invitation Link
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Invitation Link</p>
                <p className="text-sm font-mono break-all">{generatedUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleEmailShare}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setGeneratedUrl(null);
                  generateMutation.mutate();
                }}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Generate New Link
              </Button>
            </div>
          )}

          {/* Previous Invitations */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : invitations.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Previous Invitations</h4>
              {invitations.map((inv: CoachInvitation) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    {getStatusBadge(inv)}
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(inv.created_at)}
                      {inv.status === 'pending' && ` · Expires ${formatDate(inv.expires_at)}`}
                      {inv.accepted_at && ` · Accepted ${formatDate(inv.accepted_at)}`}
                    </p>
                  </div>
                  {inv.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeMutation.mutate(inv.id)}
                      disabled={revokeMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground text-center">
            Links expire after 7 days. Only one active link per coach at a time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
