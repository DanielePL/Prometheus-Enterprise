import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  CheckCircle2,
  Loader2,
  Trash2,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { deviceCheckinService } from '@/services/bluetoothCheckin';
import { accessControlService } from '@/services/accessControl';
import { Member, MemberBluetoothDevice } from '@/types/database';

interface DeviceRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
  gymId: string;
  existingDevices: MemberBluetoothDevice[];
  onSuccess?: () => void;
}

export default function DeviceRegistration({
  open,
  onOpenChange,
  member,
  gymId,
  existingDevices,
  onSuccess,
}: DeviceRegistrationProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');

  const registerCurrentDevice = async () => {
    setIsRegistering(true);

    try {
      const deviceInfo = await deviceCheckinService.getDeviceInfo();

      // Check if device is already registered
      const existingDevice = existingDevices.find(
        (d) => d.device_id === deviceInfo.deviceId
      );

      if (existingDevice) {
        toast.error('This device is already registered');
        setIsRegistering(false);
        return;
      }

      await accessControlService.registerBluetoothDevice({
        member_id: member.id,
        gym_id: gymId,
        device_id: deviceInfo.deviceId,
        device_name: deviceName || deviceInfo.deviceName,
        device_type: deviceInfo.deviceType,
      });

      toast.success('Device registered successfully!');
      setDeviceName('');
      onSuccess?.();
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Failed to register device');
    } finally {
      setIsRegistering(false);
    }
  };

  const removeDevice = async (device: MemberBluetoothDevice) => {
    try {
      await accessControlService.removeBluetoothDevice(device.id);
      toast.success('Device removed');
      onSuccess?.();
    } catch (error) {
      console.error('Remove failed:', error);
      toast.error('Failed to remove device');
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    return <Smartphone className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Device Registration - {member.name}
          </DialogTitle>
          <DialogDescription>
            Register devices for automatic check-in when entering the gym.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Devices */}
          {existingDevices.length > 0 && (
            <div className="space-y-2">
              <Label>Registered Devices</Label>
              <div className="space-y-2">
                {existingDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device_type)}
                      <div>
                        <p className="font-medium">
                          {device.device_name || 'Unknown Device'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {device.device_type || 'Unknown type'} •{' '}
                          {device.last_seen
                            ? `Last seen ${new Date(device.last_seen).toLocaleDateString()}`
                            : 'Never used'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDevice(device)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Register New Device */}
          <div className="space-y-4">
            <Label>Register This Device</Label>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="deviceName" className="text-sm text-muted-foreground">
                  Device Name (optional)
                </Label>
                <Input
                  id="deviceName"
                  placeholder="e.g., My iPhone"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                />
              </div>

              <Button
                onClick={registerCurrentDevice}
                disabled={isRegistering}
                className="w-full"
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Register This Device
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              This will register your current browser/device. You can use it for
              automatic check-in at the gym.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
