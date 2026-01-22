import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  ScanFace,
  Smartphone,
  User,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { accessControlService } from '@/services/accessControl';
import { membersService } from '@/services/members';
import { AccessLog, AccessMethod, AccessStatus, Member } from '@/types/database';
import { Link } from 'react-router-dom';

export default function AccessLogs() {
  const { gym } = useAuth();
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch access logs
  const {
    data: logs = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['access-logs', gym?.id, startDate, endDate, methodFilter, statusFilter],
    queryFn: () =>
      accessControlService.getAccessLogs(gym!.id, {
        startDate: startDate + 'T00:00:00',
        endDate: endDate + 'T23:59:59',
        method: methodFilter !== 'all' ? (methodFilter as AccessMethod) : undefined,
        status: statusFilter !== 'all' ? (statusFilter as AccessStatus) : undefined,
        limit: 500,
      }),
    enabled: !!gym?.id,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['access-stats', gym?.id, startDate, endDate],
    queryFn: () =>
      accessControlService.getAccessStats(
        gym!.id,
        startDate + 'T00:00:00',
        endDate + 'T23:59:59'
      ),
    enabled: !!gym?.id,
  });

  // Fetch members for name lookup
  const { data: members = [] } = useQuery({
    queryKey: ['members', gym?.id],
    queryFn: () => membersService.getAll(gym!.id),
    enabled: !!gym?.id,
  });

  const memberMap = new Map(members.map((m) => [m.id, m]));

  const getMemberName = (memberId: string | null): string => {
    if (!memberId) return 'Unknown';
    return memberMap.get(memberId)?.name || 'Unknown Member';
  };

  const getMethodIcon = (method: AccessMethod) => {
    switch (method) {
      case 'face_recognition':
        return <ScanFace className="h-4 w-4" />;
      case 'bluetooth':
        return <Smartphone className="h-4 w-4" />;
      case 'manual':
        return <User className="h-4 w-4" />;
      case 'qr_code':
        return <Activity className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMethodLabel = (method: AccessMethod): string => {
    switch (method) {
      case 'face_recognition':
        return 'Face';
      case 'bluetooth':
        return 'Device';
      case 'manual':
        return 'Manual';
      case 'qr_code':
        return 'QR Code';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: AccessStatus) => {
    switch (status) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Granted
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Denied
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const memberName = getMemberName(log.member_id).toLowerCase();
    return memberName.includes(searchQuery.toLowerCase());
  });

  const successRate = stats
    ? ((stats.granted / stats.totalAttempts) * 100).toFixed(1)
    : '0';

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Access Logs
          </h1>
          <p className="text-muted-foreground">
            Monitor all access attempts and check-ins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/terminal" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Terminal
            </Link>
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{stats?.totalAttempts || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Granted</p>
                <p className="text-2xl font-bold text-green-500">
                  {stats?.granted || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Denied</p>
                <p className="text-2xl font-bold text-red-500">
                  {stats?.denied || 0}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <ScanFace className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Face Recognition</p>
              <p className="font-bold">{stats?.byMethod.face_recognition || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Device</p>
              <p className="font-bold">{stats?.byMethod.bluetooth || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Manual</p>
              <p className="font-bold">{stats?.byMethod.manual || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">QR Code</p>
              <p className="font-bold">{stats?.byMethod.qr_code || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="face_recognition">Face</SelectItem>
                <SelectItem value="bluetooth">Device</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="qr_code">QR Code</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="granted">Granted</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              placeholder="Search member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Access History ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No access logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(log.attempted_at)}
                    </TableCell>
                    <TableCell>{getMemberName(log.member_id)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(log.access_method)}
                        {getMethodLabel(log.access_method)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.access_status)}</TableCell>
                    <TableCell>
                      {log.confidence_score
                        ? `${(log.confidence_score * 100).toFixed(1)}%`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.denial_reason || log.terminal_name || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
