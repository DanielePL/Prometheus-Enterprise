import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Shield,
  ScanFace,
  Smartphone,
  Clock,
  Save,
  Loader2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { accessControlService, DEFAULT_OPENING_HOURS } from '@/services/accessControl';
import { GymAccessSettings, OpeningHours, DaySchedule } from '@/types/database';

interface AccessSettingsProps {
  gymId: string;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export default function AccessSettings({ gymId }: AccessSettingsProps) {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);
  const [settings, setSettings] = useState<Partial<GymAccessSettings>>({
    bluetooth_enabled: true,
    face_recognition_enabled: true,
    qr_code_enabled: false,
    manual_checkin_enabled: true,
    face_match_threshold: 0.6,
    require_liveness_check: false,
    auto_checkout_enabled: true,
    auto_checkout_minutes: 120,
    require_active_membership: true,
    allow_expired_grace_days: 0,
    opening_hours: DEFAULT_OPENING_HOURS,
    notify_on_denied_access: true,
    notify_on_after_hours_attempt: true,
  });

  // Fetch settings
  const { data: existingSettings, isLoading } = useQuery({
    queryKey: ['access-settings', gymId],
    queryFn: () => accessControlService.getSettings(gymId),
    enabled: !!gymId,
  });

  // Sync with existing settings
  useEffect(() => {
    if (existingSettings) {
      setSettings(existingSettings);
    }
  }, [existingSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existingSettings) {
        return accessControlService.updateSettings(gymId, settings);
      } else {
        return accessControlService.createSettings({
          gym_id: gymId,
          ...settings,
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-settings', gymId] });
      toast.success('Access settings saved');
      setHasChanges(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const updateSetting = <K extends keyof GymAccessSettings>(
    key: K,
    value: GymAccessSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateOpeningHours = (
    day: keyof OpeningHours,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      opening_hours: {
        ...(prev.opening_hours || DEFAULT_OPENING_HOURS),
        [day]: {
          ...((prev.opening_hours || DEFAULT_OPENING_HOURS)[day]),
          [field]: value,
        },
      },
    }));
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Check-in Methods */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Check-in Methods
          </CardTitle>
          <CardDescription>
            Configure which check-in methods are available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ScanFace className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Face Recognition</p>
                <p className="text-sm text-muted-foreground">
                  Allow check-in via facial recognition
                </p>
              </div>
            </div>
            <Switch
              checked={settings.face_recognition_enabled}
              onCheckedChange={(checked) =>
                updateSetting('face_recognition_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Device Check-in</p>
                <p className="text-sm text-muted-foreground">
                  Allow check-in via registered devices
                </p>
              </div>
            </div>
            <Switch
              checked={settings.bluetooth_enabled}
              onCheckedChange={(checked) =>
                updateSetting('bluetooth_enabled', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manual Check-in</p>
                <p className="text-sm text-muted-foreground">
                  Allow check-in via name search
                </p>
              </div>
            </div>
            <Switch
              checked={settings.manual_checkin_enabled}
              onCheckedChange={(checked) =>
                updateSetting('manual_checkin_enabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Face Recognition Settings */}
      {settings.face_recognition_enabled && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanFace className="h-5 w-5" />
              Face Recognition Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Match Threshold ({((settings.face_match_threshold || 0.6) * 100).toFixed(0)}%)</Label>
              <Slider
                value={[(settings.face_match_threshold || 0.6) * 100]}
                onValueChange={([value]) =>
                  updateSetting('face_match_threshold', value / 100)
                }
                min={30}
                max={90}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Lower values are stricter (fewer false positives), higher values are more lenient.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Rules */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Access Rules</CardTitle>
          <CardDescription>
            Configure membership and access restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Active Membership</p>
              <p className="text-sm text-muted-foreground">
                Deny access to members with expired memberships
              </p>
            </div>
            <Switch
              checked={settings.require_active_membership}
              onCheckedChange={(checked) =>
                updateSetting('require_active_membership', checked)
              }
            />
          </div>

          {settings.require_active_membership && (
            <div className="space-y-2">
              <Label>Grace Period (days)</Label>
              <Input
                type="number"
                value={settings.allow_expired_grace_days || 0}
                onChange={(e) =>
                  updateSetting('allow_expired_grace_days', parseInt(e.target.value) || 0)
                }
                min={0}
                max={30}
              />
              <p className="text-xs text-muted-foreground">
                Allow access this many days after membership expires
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Check-out</p>
              <p className="text-sm text-muted-foreground">
                Automatically check out members after a period
              </p>
            </div>
            <Switch
              checked={settings.auto_checkout_enabled}
              onCheckedChange={(checked) =>
                updateSetting('auto_checkout_enabled', checked)
              }
            />
          </div>

          {settings.auto_checkout_enabled && (
            <div className="space-y-2">
              <Label>Auto Check-out After (minutes)</Label>
              <Input
                type="number"
                value={settings.auto_checkout_minutes || 120}
                onChange={(e) =>
                  updateSetting('auto_checkout_minutes', parseInt(e.target.value) || 120)
                }
                min={30}
                max={480}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Opening Hours
          </CardTitle>
          <CardDescription>
            Set your facility's opening hours. Access will be denied outside these times.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const daySchedule = (settings.opening_hours || DEFAULT_OPENING_HOURS)[key];
              return (
                <div key={key} className="flex items-center gap-4">
                  <div className="w-28">
                    <Label>{label}</Label>
                  </div>
                  <Switch
                    checked={!daySchedule.closed}
                    onCheckedChange={(checked) =>
                      updateOpeningHours(key, 'closed', !checked)
                    }
                  />
                  {!daySchedule.closed && (
                    <>
                      <Input
                        type="time"
                        value={daySchedule.open}
                        onChange={(e) =>
                          updateOpeningHours(key, 'open', e.target.value)
                        }
                        className="w-28"
                      />
                      <span className="text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={daySchedule.close}
                        onChange={(e) =>
                          updateOpeningHours(key, 'close', e.target.value)
                        }
                        className="w-28"
                      />
                    </>
                  )}
                  {daySchedule.closed && (
                    <span className="text-muted-foreground">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notify on Denied Access</p>
              <p className="text-sm text-muted-foreground">
                Send an alert when access is denied
              </p>
            </div>
            <Switch
              checked={settings.notify_on_denied_access}
              onCheckedChange={(checked) =>
                updateSetting('notify_on_denied_access', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notify on After-Hours Attempt</p>
              <p className="text-sm text-muted-foreground">
                Send an alert when someone tries to access outside opening hours
              </p>
            </div>
            <Switch
              checked={settings.notify_on_after_hours_attempt}
              onCheckedChange={(checked) =>
                updateSetting('notify_on_after_hours_attempt', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
