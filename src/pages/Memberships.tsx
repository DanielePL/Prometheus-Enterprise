import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CreditCard,
  FileText,
  Snowflake,
  AlertTriangle,
  Ban,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Shield,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  membershipPlansService,
  membershipContractsService,
  membershipFreezesService,
  memberWarningsService,
  memberBansService,
} from '@/services/membershipService';
import type {
  ContractStatus,
  FreezeReason,
  WarningLevel,
  BanType,
} from '@/types/database';

// ============================================================
// HELPERS
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  frozen: { label: 'Frozen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Snowflake },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: Clock },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock },
};

const FREEZE_REASON_LABELS: Record<string, string> = {
  injury: 'Injury / Accident',
  pregnancy: 'Pregnancy',
  military: 'Military Service',
  illness: 'Illness',
  relocation: 'Relocation',
  other: 'Other',
};

const BILLING_LABELS: Record<string, string> = {
  daily: 'Day Pass',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
};

const WARNING_COLORS: Record<string, string> = {
  '1': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  '2': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  '3': 'bg-red-500/20 text-red-400 border-red-500/30',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return `CHF ${amount.toFixed(2)}`;
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Memberships() {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [freezes, setFreezes] = useState<any[]>([]);
  const [warnings, setWarnings] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog states
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Form states
  const [freezeForm, setFreezeForm] = useState({
    reason: '' as FreezeReason | '',
    reason_detail: '',
    start_date: '',
    end_date: '',
    proof_type: '',
    notes: '',
  });

  const [warningForm, setWarningForm] = useState({
    member_id: '',
    warning_level: '1' as WarningLevel,
    reason: '',
    description: '',
    issued_by: 'Daniel P.',
  });

  const [banForm, setBanForm] = useState({
    member_id: '',
    ban_type: 'temporary' as BanType,
    reason: '',
    description: '',
    end_date: '',
    issued_by: 'Daniel P.',
  });

  const [cancelForm, setCancelForm] = useState({
    cancellation_type: 'regular' as 'regular' | 'extraordinary' | 'revocation',
    cancellation_reason: '',
    cancellation_effective_date: '',
  });

  const gymId = 'demo-gym-id';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [p, c, f, w, b, s] = await Promise.all([
        membershipPlansService.getAll(gymId),
        membershipContractsService.getAll(gymId),
        membershipFreezesService.getAll(gymId),
        memberWarningsService.getAll(gymId),
        memberBansService.getAll(gymId),
        membershipContractsService.getStats(gymId),
      ]);
      setPlans(p);
      setContracts(c);
      setFreezes(f);
      setWarnings(w);
      setBans(b);
      setStats(s);
    } catch {
      toast.error('Failed to load membership data');
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // FILTER LOGIC
  // ============================================================

  const filteredContracts = contracts.filter((c: any) => {
    const matchesSearch = !searchQuery ||
      c.member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contract_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const mainPlans = plans.filter((p: any) => p.category === 'main');
  const addonPlans = plans.filter((p: any) => p.category === 'addon');
  const pendingFreezes = freezes.filter((f: any) => f.status === 'pending');
  const activeWarnings = warnings.filter((w: any) => w.is_active);
  const activeBans = bans.filter((b: any) => b.is_active);

  // ============================================================
  // HANDLERS
  // ============================================================

  async function handleApproveFreeze(id: string) {
    try {
      await membershipFreezesService.approve(id, 'Daniel P.');
      toast.success('Freeze approved');
      loadData();
    } catch {
      toast.error('Failed to approve freeze');
    }
  }

  async function handleRejectFreeze(id: string) {
    try {
      await membershipFreezesService.reject(id, 'Insufficient documentation');
      toast.success('Freeze rejected');
      loadData();
    } catch {
      toast.error('Failed to reject freeze');
    }
  }

  async function handleLiftBan(id: string) {
    try {
      await memberBansService.lift(id, 'Daniel P.', 'Ban lifted');
      toast.success('Ban lifted');
      loadData();
    } catch {
      toast.error('Failed to lift ban');
    }
  }

  async function handleDeactivateWarning(id: string) {
    try {
      await memberWarningsService.deactivate(id);
      toast.success('Warning deactivated');
      loadData();
    } catch {
      toast.error('Failed to deactivate warning');
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Membership Management</h1>
          <p className="text-muted-foreground">Plans, contracts, freezes, warnings & bans</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <FileText className="h-3.5 w-3.5" />
                Contracts
              </div>
              <div className="text-2xl font-bold">{stats.totalContracts}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </div>
              <div className="text-2xl font-bold">{stats.activeContracts}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
                <Snowflake className="h-3.5 w-3.5" />
                Frozen
              </div>
              <div className="text-2xl font-bold">{stats.frozenContracts}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-400 text-xs mb-1">
                <XCircle className="h-3.5 w-3.5" />
                Cancelled
              </div>
              <div className="text-2xl font-bold">{stats.cancelledContracts}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-primary text-xs mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                MRR
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.mrr)}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Average
              </div>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgContractValue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert Badges */}
      {(pendingFreezes.length > 0 || activeBans.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {pendingFreezes.length > 0 && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 cursor-pointer" onClick={() => setActiveTab('freezes')}>
              <Snowflake className="h-3 w-3 mr-1" />
              {pendingFreezes.length} pending freeze request{pendingFreezes.length > 1 ? 's' : ''}
            </Badge>
          )}
          {activeBans.length > 0 && (
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 cursor-pointer" onClick={() => setActiveTab('disciplinary')}>
              <Ban className="h-3 w-3 mr-1" />
              {activeBans.length} active ban{activeBans.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass">
          <TabsTrigger value="plans" className="gap-1.5">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contracts</span>
          </TabsTrigger>
          <TabsTrigger value="freezes" className="gap-1.5 relative">
            <Snowflake className="h-4 w-4" />
            <span className="hidden sm:inline">Freezes</span>
            {pendingFreezes.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 text-[10px] flex items-center justify-center text-black font-bold">
                {pendingFreezes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="disciplinary" className="gap-1.5 relative">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Disciplinary</span>
            {activeBans.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white font-bold">
                {activeBans.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* PLANS TAB */}
        {/* ============================================================ */}
        <TabsContent value="plans" className="space-y-6">
          {/* Main Plans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Main Plans</h2>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Plan
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainPlans.map((plan: any) => (
                <Card key={plan.id} className="glass relative overflow-hidden">
                  {plan.is_popular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: plan.color }} />
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">CHF {plan.price}</span>
                      <span className="text-muted-foreground text-sm">/{BILLING_LABELS[plan.billing_interval] || plan.billing_interval}</span>
                    </div>
                    {plan.setup_fee > 0 && (
                      <p className="text-xs text-muted-foreground">+ CHF {plan.setup_fee} one-time setup fee</p>
                    )}
                    <div className="text-xs space-y-1.5 pt-2 border-t border-border/50">
                      {plan.min_contract_months > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min. contract</span>
                          <span>{plan.min_contract_months} months</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cancellation notice</span>
                        <span>{plan.cancellation_notice_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active members</span>
                        <span>{plan.current_member_count}{plan.max_members ? `/${plan.max_members}` : ''}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {(plan.features as string[])?.slice(0, 4).map((f: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                          {f}
                        </Badge>
                      ))}
                      {(plan.features as string[])?.length > 4 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          +{(plan.features as string[]).length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Addon Plans */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add-on Plans</h2>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Add-on
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {addonPlans.map((plan: any) => (
                <Card key={plan.id} className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                      <span className="font-medium text-sm">{plan.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-bold">CHF {plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.current_member_count} active</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* CONTRACTS TAB */}
        {/* ============================================================ */}
        <TabsContent value="contracts" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search member or contract number..."
                className="pl-9 glass"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] glass">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Table */}
          <Card className="glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-3 text-muted-foreground font-medium">Member</th>
                    <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Contract</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Plan</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-3 text-muted-foreground font-medium hidden md:table-cell">Duration</th>
                    <th className="text-left p-3 text-muted-foreground font-medium hidden lg:table-cell">Next Billing</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract: any) => {
                    const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    const daysLeft = daysUntil(contract.end_date);
                    const isExpiring = daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && contract.status === 'active';

                    return (
                      <tr key={contract.id} className="border-b border-border/30 hover:bg-white/5 transition-colors">
                        <td className="p-3">
                          <div className="font-medium">{contract.member?.name}</div>
                          <div className="text-xs text-muted-foreground">{contract.member?.email}</div>
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <span className="font-mono text-xs">{contract.contract_number}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: contract.plan?.color }} />
                            <span className="truncate">{contract.plan?.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`${statusConfig.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="hidden sm:inline">{statusConfig.label}</span>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{formatCurrency(contract.monthly_amount)}</div>
                          {contract.discount_percent > 0 && (
                            <div className="text-xs text-emerald-400">-{contract.discount_percent}%</div>
                          )}
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="text-xs">
                            {formatDate(contract.start_date)} — {formatDate(contract.end_date)}
                          </div>
                          {isExpiring && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30 text-[10px] mt-1">
                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                              Expires in {daysLeft} days
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 hidden lg:table-cell">
                          <span className="text-xs">{formatDate(contract.next_billing_date)}</span>
                        </td>
                        <td className="p-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {contract.status === 'active' && (
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedContract(contract);
                                    setSelectedMemberId(contract.member_id);
                                    setShowFreezeDialog(true);
                                  }}>
                                    <Snowflake className="h-4 w-4 mr-2" />
                                    Request Freeze
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedContract(contract);
                                    setShowCancelDialog(true);
                                  }}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Contract
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => {
                                setWarningForm(prev => ({ ...prev, member_id: contract.member_id }));
                                setShowWarningDialog(true);
                              }}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Issue Warning
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setBanForm(prev => ({ ...prev, member_id: contract.member_id }));
                                setShowBanDialog(true);
                              }}>
                                <Ban className="h-4 w-4 mr-2" />
                                Ban Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredContracts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No contracts found.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* FREEZES TAB */}
        {/* ============================================================ */}
        <TabsContent value="freezes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Membership Freezes</h2>
          </div>

          {freezes.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center text-muted-foreground">
                No freeze requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {freezes.map((freeze: any) => {
                const statusConfig = STATUS_CONFIG[freeze.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                const freezeDays = Math.ceil(
                  (new Date(freeze.end_date).getTime() - new Date(freeze.start_date).getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={freeze.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{freeze.member?.name}</span>
                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            <Badge variant="outline">
                              {FREEZE_REASON_LABELS[freeze.reason] || freeze.reason}
                            </Badge>
                          </div>
                          {freeze.reason_detail && (
                            <p className="text-sm text-muted-foreground">{freeze.reason_detail}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Period: {formatDate(freeze.start_date)} — {formatDate(freeze.end_date)} ({freezeDays} days)</span>
                            {freeze.proof_type && <span>Proof: {freeze.proof_type}</span>}
                            {freeze.contract?.contract_number && (
                              <span>Contract: {freeze.contract.contract_number}</span>
                            )}
                          </div>
                          {freeze.notes && (
                            <p className="text-xs italic text-muted-foreground">{freeze.notes}</p>
                          )}
                        </div>
                        {freeze.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1"
                              onClick={() => handleApproveFreeze(freeze.id)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 text-red-400 hover:text-red-300"
                              onClick={() => handleRejectFreeze(freeze.id)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* DISCIPLINARY TAB */}
        {/* ============================================================ */}
        <TabsContent value="disciplinary" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Warnings & Bans</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowWarningDialog(true)}>
                <AlertTriangle className="h-4 w-4" />
                Warning
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-red-400 hover:text-red-300" onClick={() => setShowBanDialog(true)}>
                <Ban className="h-4 w-4" />
                Ban
              </Button>
            </div>
          </div>

          {/* Active Bans */}
          {activeBans.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <Ban className="h-4 w-4" />
                Active Bans ({activeBans.length})
              </h3>
              <div className="space-y-3">
                {activeBans.map((ban: any) => {
                  const daysLeft = daysUntil(ban.end_date);
                  return (
                    <Card key={ban.id} className="glass border-red-500/20">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{ban.member?.name}</span>
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                {ban.ban_type === 'permanent' ? 'Permanent' : 'Temporary'}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium">{ban.reason}</p>
                            {ban.description && (
                              <p className="text-xs text-muted-foreground">{ban.description}</p>
                            )}
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <span>Since: {formatDate(ban.start_date)}</span>
                              {ban.end_date && <span>Until: {formatDate(ban.end_date)}</span>}
                              {daysLeft !== null && daysLeft > 0 && (
                                <span className="text-yellow-400">{daysLeft} days remaining</span>
                              )}
                              <span>Issued by: {ban.issued_by}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLiftBan(ban.id)}
                          >
                            Lift Ban
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Warnings */}
          <div>
            <h3 className="text-sm font-medium text-yellow-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Warnings ({activeWarnings.length})
            </h3>
            {activeWarnings.length === 0 ? (
              <Card className="glass">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active warnings.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeWarnings.map((warning: any) => (
                  <Card key={warning.id} className="glass">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{warning.member?.name}</span>
                            <Badge variant="outline" className={WARNING_COLORS[warning.warning_level]}>
                              Level {warning.warning_level}
                            </Badge>
                            {warning.acknowledged_at && (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">{warning.reason}</p>
                          {warning.description && (
                            <p className="text-xs text-muted-foreground">{warning.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                            <span>Date: {formatDate(warning.issued_at)}</span>
                            {warning.expires_at && <span>Valid until: {formatDate(warning.expires_at)}</span>}
                            <span>Issued by: {warning.issued_by}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleDeactivateWarning(warning.id)}
                        >
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* History of all warnings/bans */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Full History</h3>
            <Card className="glass overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Member</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Reason</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ...warnings.map((w: any) => ({ ...w, _type: 'warning', _date: w.issued_at })),
                      ...bans.map((b: any) => ({ ...b, _type: 'ban', _date: b.issued_at })),
                    ]
                      .sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())
                      .map((item: any) => (
                        <tr key={item.id} className="border-b border-border/30">
                          <td className="p-3">
                            {item._type === 'warning' ? (
                              <Badge variant="outline" className={WARNING_COLORS[item.warning_level]}>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Level {item.warning_level}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                <Ban className="h-3 w-3 mr-1" />
                                {item.ban_type === 'permanent' ? 'Perm.' : 'Temp.'} Ban
                              </Badge>
                            )}
                          </td>
                          <td className="p-3">{item.member?.name}</td>
                          <td className="p-3 max-w-xs truncate">{item.reason}</td>
                          <td className="p-3 text-xs">{formatDate(item._date)}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={item.is_active
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                            }>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================ */}
      {/* FREEZE DIALOG */}
      {/* ============================================================ */}
      <Dialog open={showFreezeDialog} onOpenChange={setShowFreezeDialog}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Request Membership Freeze</DialogTitle>
            <DialogDescription>
              {selectedContract?.member?.name} — {selectedContract?.contract_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <Select value={freezeForm.reason} onValueChange={(v) => setFreezeForm(prev => ({ ...prev, reason: v as FreezeReason }))}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREEZE_REASON_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Details</Label>
              <Textarea
                className="glass"
                placeholder="Describe the reason..."
                value={freezeForm.reason_detail}
                onChange={(e) => setFreezeForm(prev => ({ ...prev, reason_detail: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input
                  type="date"
                  className="glass"
                  value={freezeForm.start_date}
                  onChange={(e) => setFreezeForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Until</Label>
                <Input
                  type="date"
                  className="glass"
                  value={freezeForm.end_date}
                  onChange={(e) => setFreezeForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Proof Type</Label>
              <Select value={freezeForm.proof_type} onValueChange={(v) => setFreezeForm(prev => ({ ...prev, proof_type: v }))}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Optional..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical_certificate">Medical Certificate</SelectItem>
                  <SelectItem value="military_order">Military Order</SelectItem>
                  <SelectItem value="employer_confirmation">Employer Confirmation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                className="glass"
                placeholder="Internal notes..."
                value={freezeForm.notes}
                onChange={(e) => setFreezeForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFreezeDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Freeze request created');
              setShowFreezeDialog(false);
              setFreezeForm({ reason: '', reason_detail: '', start_date: '', end_date: '', proof_type: '', notes: '' });
            }}>
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* WARNING DIALOG */}
      {/* ============================================================ */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Warning</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Level</Label>
              <Select value={warningForm.warning_level} onValueChange={(v) => setWarningForm(prev => ({ ...prev, warning_level: v as WarningLevel }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 — Verbal / Written Warning</SelectItem>
                  <SelectItem value="2">Level 2 — Formal Warning</SelectItem>
                  <SelectItem value="3">Level 3 — Final Warning Before Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                className="glass"
                placeholder="Brief summary..."
                value={warningForm.reason}
                onChange={(e) => setWarningForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="glass"
                placeholder="Detailed description of the incident..."
                value={warningForm.description}
                onChange={(e) => setWarningForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWarningDialog(false)}>Cancel</Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => {
                toast.success('Warning issued');
                setShowWarningDialog(false);
                setWarningForm({ member_id: '', warning_level: '1', reason: '', description: '', issued_by: 'Daniel P.' });
              }}
            >
              Issue Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* BAN DIALOG */}
      {/* ============================================================ */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Ban Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ban Type</Label>
              <Select value={banForm.ban_type} onValueChange={(v) => setBanForm(prev => ({ ...prev, ban_type: v as BanType }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary Ban</SelectItem>
                  <SelectItem value="permanent">Permanent Ban (Trespass Notice)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {banForm.ban_type === 'temporary' && (
              <div>
                <Label>Ban until</Label>
                <Input
                  type="date"
                  className="glass"
                  value={banForm.end_date}
                  onChange={(e) => setBanForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            )}
            <div>
              <Label>Reason</Label>
              <Input
                className="glass"
                placeholder="Reason for ban..."
                value={banForm.reason}
                onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="glass"
                placeholder="Detailed documentation..."
                value={banForm.description}
                onChange={(e) => setBanForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success('Ban issued');
                setShowBanDialog(false);
                setBanForm({ member_id: '', ban_type: 'temporary', reason: '', description: '', end_date: '', issued_by: 'Daniel P.' });
              }}
            >
              Issue Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* CANCEL CONTRACT DIALOG */}
      {/* ============================================================ */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Contract</DialogTitle>
            <DialogDescription>
              {selectedContract?.member?.name} — {selectedContract?.contract_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cancellation Type</Label>
              <Select value={cancelForm.cancellation_type} onValueChange={(v) => setCancelForm(prev => ({ ...prev, cancellation_type: v as any }))}>
                <SelectTrigger className="glass">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular Cancellation</SelectItem>
                  <SelectItem value="extraordinary">Extraordinary (Medical, Relocation, etc.)</SelectItem>
                  <SelectItem value="revocation">Revocation (14-Day Cooling-Off Period)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                className="glass"
                value={cancelForm.cancellation_effective_date}
                onChange={(e) => setCancelForm(prev => ({ ...prev, cancellation_effective_date: e.target.value }))}
              />
              {selectedContract && (
                <p className="text-xs text-muted-foreground mt-1">
                  Notice period: {selectedContract.plan?.cancellation_notice_days || 30} days
                </p>
              )}
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                className="glass"
                placeholder="Cancellation reason..."
                value={cancelForm.cancellation_reason}
                onChange={(e) => setCancelForm(prev => ({ ...prev, cancellation_reason: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Back</Button>
            <Button
              variant="destructive"
              onClick={() => {
                toast.success('Contract cancelled');
                setShowCancelDialog(false);
                setCancelForm({ cancellation_type: 'regular', cancellation_reason: '', cancellation_effective_date: '' });
                setSelectedContract(null);
              }}
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
