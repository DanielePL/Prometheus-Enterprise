import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ScanFace,
  Smartphone,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
} from 'lucide-react';
import { accessControlService } from '@/services/accessControl';
import { Member, MemberFaceData, MemberBluetoothDevice, AccessLog } from '@/types/database';
import FaceRegistration from '@/components/access/FaceRegistration';
import DeviceRegistration from '@/components/access/DeviceRegistration';

interface MemberAccessCardProps {
  member: Member;
  gymId: string;
}

export default function MemberAccessCard({ member, gymId }: MemberAccessCardProps) {
  const queryClient = useQueryClient();
  const [showFaceRegistration, setShowFaceRegistration] = useState(false);
  const [showDeviceRegistration, setShowDeviceRegistration] = useState(false);

  // Fetch access info
  const { data: accessInfo } = useQuery({
    queryKey: ['member-access-info', member.id],
    queryFn: () => accessControlService.getMemberAccessInfo(member.id),
    enabled: !!member.id,
  });

  // Fetch face data
  const { data: faceData } = useQuery({
    queryKey: ['member-face-data', member.id],
    queryFn: () => accessControlService.getFaceDataByMember(member.id),
    enabled: !!member.id,
  });

  // Fetch bluetooth devices
  const { data: devices = [] } = useQuery({
    queryKey: ['member-bluetooth-devices', member.id],
    queryFn: () => accessControlService.getBluetoothDevices(member.id),
    enabled: !!member.id,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['member-access-info', member.id] });
    queryClient.invalidateQueries({ queryKey: ['member-face-data', member.id] });
    queryClient.invalidateQueries({ queryKey: ['member-bluetooth-devices', member.id] });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Access Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Face Recognition */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <ScanFace className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Face Recognition</p>
                <p className="text-xs text-muted-foreground">
                  {faceData ? 'Registered' : 'Not registered'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {faceData ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Set
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFaceRegistration(true)}
              >
                {faceData ? 'Update' : 'Register'}
              </Button>
            </div>
          </div>

          {/* Device Check-in */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Device Check-in</p>
                <p className="text-xs text-muted-foreground">
                  {devices.length > 0
                    ? `${devices.length} device(s) registered`
                    : 'No devices registered'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {devices.length > 0 ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {devices.length}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  None
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeviceRegistration(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Manage
              </Button>
            </div>
          </div>

          {/* Recent Access */}
          {accessInfo?.recentAccess && accessInfo.recentAccess.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </p>
              <div className="space-y-1">
                {accessInfo.recentAccess.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between text-xs text-muted-foreground"
                  >
                    <span>{formatDateTime(log.attempted_at)}</span>
                    <Badge
                      variant={log.access_status === 'granted' ? 'default' : 'destructive'}
                      className="text-xs py-0"
                    >
                      {log.access_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Face Registration Dialog */}
      <FaceRegistration
        open={showFaceRegistration}
        onOpenChange={setShowFaceRegistration}
        member={member}
        gymId={gymId}
        existingFaceData={faceData}
        onSuccess={handleRefresh}
      />

      {/* Device Registration Dialog */}
      <DeviceRegistration
        open={showDeviceRegistration}
        onOpenChange={setShowDeviceRegistration}
        member={member}
        gymId={gymId}
        existingDevices={devices}
        onSuccess={handleRefresh}
      />
    </>
  );
}
