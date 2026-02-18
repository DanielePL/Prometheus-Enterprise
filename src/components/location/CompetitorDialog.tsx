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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CompetitorData } from '@/services/locationDemoData';

interface CompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitor?: CompetitorData;
  onSave: (data: Omit<CompetitorData, 'id'>) => void;
}

const EMPTY_FORM = {
  name: '',
  address: '',
  postal_code: '',
  city: 'Zürich',
  lat: 47.377,
  lng: 8.532,
  pricing_tier: 'mid' as const,
  monthly_price: 0,
  estimated_members: 0,
  notes: '',
};

export default function CompetitorDialog({
  open,
  onOpenChange,
  competitor,
  onSave,
}: CompetitorDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (competitor) {
      setForm({
        name: competitor.name,
        address: competitor.address,
        postal_code: competitor.postal_code,
        city: competitor.city,
        lat: competitor.lat,
        lng: competitor.lng,
        pricing_tier: competitor.pricing_tier,
        monthly_price: competitor.monthly_price,
        estimated_members: competitor.estimated_members,
        notes: competitor.notes,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [competitor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {competitor ? 'Edit Competitor' : 'Add Competitor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="comp-name">Name</Label>
              <Input
                id="comp-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Gym name"
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="comp-address">Address</Label>
              <Input
                id="comp-address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp-postal">Postal Code</Label>
              <Input
                id="comp-postal"
                value={form.postal_code}
                onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                placeholder="8001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp-city">City</Label>
              <Input
                id="comp-city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Zürich"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp-pricing">Pricing Tier</Label>
              <Select
                value={form.pricing_tier}
                onValueChange={(v) =>
                  setForm({ ...form, pricing_tier: v as CompetitorData['pricing_tier'] })
                }
              >
                <SelectTrigger id="comp-pricing">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid">Mid-Range</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp-price">Monthly Price (CHF)</Label>
              <Input
                id="comp-price"
                type="number"
                min="0"
                value={form.monthly_price}
                onChange={(e) =>
                  setForm({ ...form, monthly_price: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comp-members">Estimated Members</Label>
              <Input
                id="comp-members"
                type="number"
                min="0"
                value={form.estimated_members}
                onChange={(e) =>
                  setForm({ ...form, estimated_members: Number(e.target.value) })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="comp-notes">Notes</Label>
              <Input
                id="comp-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
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
              {competitor ? 'Save Changes' : 'Add Competitor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
