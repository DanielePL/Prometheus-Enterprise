import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { CompetitorData } from '@/services/locationDemoData';

interface CompetitorTableProps {
  competitors: CompetitorData[];
  onAdd: () => void;
  onEdit: (competitor: CompetitorData) => void;
  onDelete: (id: string) => void;
}

const TIER_COLORS: Record<string, string> = {
  budget: 'bg-green-500/15 text-green-600 border-green-500/30',
  mid: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  premium: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  luxury: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
};

const TIER_LABELS: Record<string, string> = {
  budget: 'Budget',
  mid: 'Mid-Range',
  premium: 'Premium',
  luxury: 'Luxury',
};

export default function CompetitorTable({
  competitors,
  onAdd,
  onEdit,
  onDelete,
}: CompetitorTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {competitors.length} competitor{competitors.length !== 1 ? 's' : ''} tracked
        </p>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead className="text-right">Monthly Price</TableHead>
              <TableHead className="text-right">Est. Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((comp) => (
              <TableRow key={comp.id}>
                <TableCell className="font-medium">{comp.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {comp.postal_code} {comp.city}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={TIER_COLORS[comp.pricing_tier] || ''}
                  >
                    {TIER_LABELS[comp.pricing_tier] || comp.pricing_tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  CHF {comp.monthly_price}
                </TableCell>
                <TableCell className="text-right">
                  {comp.estimated_members.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(comp)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(comp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {competitors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No competitors tracked yet. Click "Add Competitor" to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
