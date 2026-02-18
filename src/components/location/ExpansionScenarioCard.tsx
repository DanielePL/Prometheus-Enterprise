import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  DollarSign,
  Users,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  Building2,
} from 'lucide-react';
import type { ExpansionScenarioData } from '@/services/locationDemoData';

interface ExpansionScenarioCardProps {
  scenario: ExpansionScenarioData;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  evaluating: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  approved: 'bg-green-500/15 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-600 border-red-500/30',
};

export default function ExpansionScenarioCard({
  scenario,
  onEdit,
  onDelete,
}: ExpansionScenarioCardProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{scenario.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {scenario.postal_code} {scenario.city}
              </div>
            </div>
          </div>
          <Badge variant="outline" className={STATUS_STYLES[scenario.status] || ''}>
            {scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1)}
          </Badge>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Investment
            </div>
            <p className="font-semibold">
              CHF {scenario.investment.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" />
              Est. Members
            </div>
            <p className="font-semibold">{scenario.estimated_members}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              ROI Period
            </div>
            <p className="font-semibold">{scenario.roi_months} months</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Monthly Revenue
            </div>
            <p className="font-semibold">
              CHF {scenario.estimated_monthly_revenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cannibalization warning */}
        {scenario.cannibalization_pct > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {scenario.cannibalization_pct}% estimated cannibalization from existing location
            </p>
          </div>
        )}

        {/* Notes */}
        {scenario.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {scenario.notes}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
