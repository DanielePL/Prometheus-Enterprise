import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ExpansionScenarioData } from '@/services/locationDemoData';

interface NewScenarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario?: ExpansionScenarioData;
  onSave: (data: Omit<ExpansionScenarioData, 'id'>) => void;
}

const EMPTY_FORM: Omit<ExpansionScenarioData, 'id'> = {
  name: '',
  address: '',
  postal_code: '',
  city: 'Zürich',
  lat: 47.377,
  lng: 8.532,
  investment: 0,
  monthly_rent: 0,
  area_sqm: 0,
  estimated_members: 0,
  estimated_monthly_revenue: 0,
  roi_months: 0,
  cannibalization_pct: 0,
  notes: '',
  status: 'draft',
};

export default function NewScenarioDialog({
  open,
  onOpenChange,
  scenario,
  onSave,
}: NewScenarioDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (scenario) {
      const { id: _id, ...rest } = scenario;
      setForm(rest);
    } else {
      setForm(EMPTY_FORM);
    }
  }, [scenario, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  const setNum = (field: string, value: string) => {
    setForm({ ...form, [field]: Number(value) || 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {scenario ? 'Edit Scenario' : 'New Expansion Scenario'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="scen-name">Scenario Name</Label>
              <Input
                id="scen-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Oerlikon Nord"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="scen-address">Address</Label>
              <Input
                id="scen-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scen-postal">Postal Code</Label>
              <Input
                id="scen-postal"
                value={form.postal_code}
                onChange={(e) =>
                  setForm({ ...form, postal_code: e.target.value })
                }
                placeholder="8050"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scen-city">City</Label>
              <Input
                id="scen-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Zürich"
              />
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Financial Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scen-investment">Investment (CHF)</Label>
                <Input
                  id="scen-investment"
                  type="number"
                  min="0"
                  value={form.investment}
                  onChange={(e) => setNum('investment', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-rent">Monthly Rent (CHF)</Label>
                <Input
                  id="scen-rent"
                  type="number"
                  min="0"
                  value={form.monthly_rent}
                  onChange={(e) => setNum('monthly_rent', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-area">Area (sqm)</Label>
                <Input
                  id="scen-area"
                  type="number"
                  min="0"
                  value={form.area_sqm}
                  onChange={(e) => setNum('area_sqm', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-members">Estimated Members</Label>
                <Input
                  id="scen-members"
                  type="number"
                  min="0"
                  value={form.estimated_members}
                  onChange={(e) => setNum('estimated_members', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-revenue">Est. Monthly Revenue (CHF)</Label>
                <Input
                  id="scen-revenue"
                  type="number"
                  min="0"
                  value={form.estimated_monthly_revenue}
                  onChange={(e) =>
                    setNum('estimated_monthly_revenue', e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-roi">ROI Months</Label>
                <Input
                  id="scen-roi"
                  type="number"
                  min="0"
                  value={form.roi_months}
                  onChange={(e) => setNum('roi_months', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scen-cannib">Cannibalization (%)</Label>
                <Input
                  id="scen-cannib"
                  type="number"
                  min="0"
                  max="100"
                  value={form.cannibalization_pct}
                  onChange={(e) => setNum('cannibalization_pct', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="scen-notes">Notes</Label>
            <Input
              id="scen-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional notes about the scenario..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {scenario ? 'Save Changes' : 'Create Scenario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
