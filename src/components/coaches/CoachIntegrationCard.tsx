import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link2, Unlink, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import type { CoachIntegrationRow } from '@/types/database';
import type { CoachCachedData } from '@/types/coachIntegration';
import { coachDeepLinks } from '@/config/coachIntegration';
import { format } from 'date-fns';

interface CoachIntegrationCardProps {
  integration: CoachIntegrationRow | null;
  onLink: () => void;
  onUnlink?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function CoachIntegrationCard({
  integration,
  onLink,
  onUnlink,
  onRefresh,
  refreshing,
}: CoachIntegrationCardProps) {
  if (!integration) {
    return (
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-dashed border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-muted-foreground">Not linked to Coach App</p>
            <p className="text-sm text-muted-foreground">
              Connect to see coaching data
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Link
        </Button>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; label: string }> = {
    pending: { color: 'bg-yellow-500', label: 'Pending' },
    linked: { color: 'bg-green-500', label: 'Linked' },
    unlinked: { color: 'bg-gray-500', label: 'Unlinked' },
    error: { color: 'bg-destructive', label: 'Error' },
  };

  const config = statusConfig[integration.status] || statusConfig.error;
  const cached = (integration.cached_data || {}) as CoachCachedData;

  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/20">
            <Link2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">Prometheus Coach</p>
              <Badge className={config.color}>{config.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {integration.coach_app_email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {integration.status === 'linked' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh data"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open(coachDeepLinks.dashboard(), '_blank')}
                title="Open Coach App"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </>
          )}
          {integration.status === 'linked' && onUnlink && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onUnlink}
              title="Unlink"
              className="text-muted-foreground hover:text-destructive"
            >
              <Unlink className="h-4 w-4" />
            </Button>
          )}
          {(integration.status === 'error' || integration.status === 'unlinked') && (
            <Button variant="outline" size="sm" onClick={onLink}>
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* Summary stats if linked */}
      {integration.status === 'linked' && (cached.totalClients !== undefined) && (
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-lg font-semibold">{cached.totalClients || 0}</p>
            <p className="text-xs text-muted-foreground">Clients</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{cached.totalWorkouts || 0}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{cached.totalPrograms || 0}</p>
            <p className="text-xs text-muted-foreground">Programs</p>
          </div>
        </div>
      )}

      {integration.last_sync_at && (
        <p className="text-xs text-muted-foreground">
          Last synced: {format(new Date(integration.last_sync_at), 'MMM d, yyyy HH:mm')}
        </p>
      )}
    </div>
  );
}
