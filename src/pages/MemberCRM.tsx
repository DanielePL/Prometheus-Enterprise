import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  AlertTriangle,
  TrendingUp,
  Mail,
  Phone,
  MoreHorizontal,
  Pencil,
  Trash2,
  LogIn,
  Loader2,
  Clock,
  Sparkles,
  StickyNote,
  Plus,
  X,
  Heart,
  CreditCard,
  MessageSquare,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { membersService } from "@/services/members";
import { coachesService } from "@/services/coaches";
import { memberNotesService } from "@/services/memberNotes";
import { MemberNote } from "@/services/demoData";
import MemberDialog, { MemberFormData } from "@/components/members/MemberDialog";
import DeleteMemberDialog from "@/components/members/DeleteMemberDialog";
import CommunicationCenter from "@/components/members/CommunicationCenter";
import type { Member, Coach, ActivityStatus, MembershipType } from "@/types/database";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { generateMemberToken } from "@/services/qrCheckin";

const MemberCRM = () => {
  const { gym, profile } = useAuth();
  const { memberLimit } = useSubscription();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [coachFilter, setCoachFilter] = useState<string>("all");
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteMember, setNoteMember] = useState<Member | null>(null);
  const [newNote, setNewNote] = useState("");
  const [notePriority, setNotePriority] = useState<"low" | "medium" | "high">("medium");
  const [noteCategory, setNoteCategory] = useState<"health" | "personal" | "payment" | "other">("other");
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrMember, setQrMember] = useState<Member | null>(null);

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members", gym?.id],
    queryFn: () => (gym?.id ? membersService.getAll(gym.id) : Promise.resolve([])),
    enabled: !!gym?.id,
  });

  // Fetch coaches for dropdown
  const { data: coaches = [] } = useQuery({
    queryKey: ["coaches", gym?.id],
    queryFn: () => (gym?.id ? coachesService.getActive(gym.id) : Promise.resolve([])),
    enabled: !!gym?.id,
  });

  // Fetch notes for all members
  const memberIds = useMemo(() => members.map((m: Member) => m.id), [members]);
  const { data: memberNotes = {} } = useQuery({
    queryKey: ["memberNotes", memberIds],
    queryFn: () => memberNotesService.getActiveNotesForMembers(memberIds),
    enabled: memberIds.length > 0,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (data: { member_id: string; note: string; priority: "low" | "medium" | "high"; category: "health" | "personal" | "payment" | "other" }) =>
      memberNotesService.create({
        ...data,
        created_by: profile?.name || "Staff",
        is_active: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberNotes"] });
      toast.success("Note added successfully");
      setNoteDialogOpen(false);
      setNewNote("");
      setNotePriority("medium");
      setNoteCategory("other");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => memberNotesService.deactivate(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memberNotes"] });
      toast.success("Note removed");
    },
  });

  // Filter members added today from the main members list
  const todayMembers = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return members.filter((m: Member) => {
      const createdAt = new Date(m.created_at);
      return createdAt >= today;
    });
  }, [members]);

  // Create member mutation
  const createMutation = useMutation({
    mutationFn: (data: MemberFormData) =>
      membersService.create({
        ...data,
        gym_id: gym!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update member mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemberFormData }) =>
      membersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (memberId: string) =>
      membersService.checkIn(memberId, gym!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Check-in successful");
    },
    onError: (error: Error) => {
      toast.error(`Check-in failed: ${error.message}`);
    },
  });

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return members.filter((member: Member) => {
      const matchesSearch =
        searchTerm === "" ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || member.activity_status === statusFilter;

      const matchesCoach =
        coachFilter === "all" ||
        (coachFilter === "none" && !member.coach_id) ||
        member.coach_id === coachFilter;

      return matchesSearch && matchesStatus && matchesCoach;
    });
  }, [members, searchTerm, statusFilter, coachFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m: Member) => m.activity_status === "active").length;
    const moderate = members.filter((m: Member) => m.activity_status === "moderate").length;
    const inactive = members.filter((m: Member) => m.activity_status === "inactive").length;

    return [
      { label: "Total", value: total.toString(), icon: Users, color: "text-blue-500" },
      { label: "Active", value: active.toString(), icon: TrendingUp, color: "text-green-500" },
      { label: "Moderate", value: moderate.toString(), icon: AlertTriangle, color: "text-yellow-500" },
      { label: "Inactive", value: inactive.toString(), icon: AlertTriangle, color: "text-red-500" },
    ];
  }, [members]);

  const atRiskMembers = useMemo(
    () => members.filter((m: Member) => m.activity_status === "inactive" || m.activity_status === "moderate"),
    [members]
  );

  // Get all members with notes
  const membersWithNotes = useMemo(() => {
    return members.filter((m: Member) => memberNotes[m.id]?.length > 0);
  }, [members, memberNotes]);

  const handleAddMember = () => {
    setSelectedMember(null);
    setMemberDialogOpen(true);
  };

  const handleAddNote = (member: Member) => {
    setNoteMember(member);
    setNewNote("");
    setNotePriority("medium");
    setNoteCategory("other");
    setNoteDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (!noteMember || !newNote.trim()) return;
    createNoteMutation.mutate({
      member_id: noteMember.id,
      note: newNote.trim(),
      priority: notePriority,
      category: noteCategory,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return <Heart className="h-4 w-4" />;
      case "payment": return <CreditCard className="h-4 w-4" />;
      case "personal": return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  const handleSaveMember = async (data: MemberFormData) => {
    if (selectedMember) {
      await updateMutation.mutateAsync({ id: selectedMember.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedMember) {
      await deleteMutation.mutateAsync(selectedMember.id);
    }
  };

  const formatLastVisit = (lastVisit: string | null) => {
    if (!lastVisit) return "Never";
    const date = new Date(lastVisit);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "moderate":
        return <Badge className="bg-yellow-500">Moderate</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMembershipBadge = (type: MembershipType) => {
    const colors: Record<MembershipType, string> = {
      trial: "bg-gray-500",
      basic: "bg-blue-500",
      premium: "bg-purple-500",
      vip: "bg-amber-500",
    };
    return (
      <Badge className={colors[type]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getCoachName = (coachId: string | null) => {
    if (!coachId) return "No Coach";
    const coach = coaches.find((c: Coach) => c.id === coachId);
    return coach?.name || "Unknown";
  };

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Member CRM</h1>
          <p className="text-muted-foreground">
            Manage members and track engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          {memberLimit > 0 && (
            <span className="text-sm text-muted-foreground">
              {members.length} / {memberLimit} members
            </span>
          )}
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (memberLimit > 0 && members.length >= memberLimit) {
                toast.error(`Member limit reached (${memberLimit}). Upgrade your plan for more.`);
                return;
              }
              handleAddMember();
            }}
            disabled={memberLimit > 0 && members.length >= memberLimit}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={coachFilter} onValueChange={setCoachFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Coach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coaches</SelectItem>
                  <SelectItem value="none">No Coach</SelectItem>
                  {coaches.map((coach: Coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList className="glass flex-wrap">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notes" className="relative">
            Notes
            {membersWithNotes.length > 0 && (
              <Badge variant="default" className="ml-2 bg-orange-500 text-white text-xs px-1.5 py-0">
                {membersWithNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="today" className="relative">
            Added Today
            {todayMembers.length > 0 && (
              <Badge variant="default" className="ml-2 bg-green-500 text-white text-xs px-1.5 py-0">
                {todayMembers.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead className="hidden md:table-cell">Membership</TableHead>
                    <TableHead className="hidden lg:table-cell">Coach</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || coachFilter !== "all"
                          ? "No members found"
                          : "No members yet"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member: Member) => (
                      <TableRow key={member.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/20 text-primary">
                                  {member.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              {memberNotes[member.id]?.length > 0 && (
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 rounded-full flex items-center justify-center">
                                  <StickyNote className="h-2.5 w-2.5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground hidden sm:block">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getMembershipBadge(member.membership_type)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {getCoachName(member.coach_id)}
                        </TableCell>
                        <TableCell>{getStatusBadge(member.activity_status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatLastVisit(member.last_visit)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => checkInMutation.mutate(member.id)}
                              title="Check-in"
                            >
                              <LogIn className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAddNote(member)}>
                                  <StickyNote className="h-4 w-4 mr-2" />
                                  Add Note
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setQrMember(member); setQrDialogOpen(true); }}>
                                  <QrCode className="h-4 w-4 mr-2" />
                                  Show QR Code
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteMember(member)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-orange-500" />
                Member Notes & Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersWithNotes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <StickyNote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No notes yet</p>
                  <p className="text-sm">Add notes to members to see reminders when they check in</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {membersWithNotes.map((member: Member) => (
                    <div key={member.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {member.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleAddNote(member)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Note
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {memberNotes[member.id]?.map((note: MemberNote) => (
                          <div
                            key={note.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className={`mt-0.5 p-1.5 rounded-full ${getPriorityColor(note.priority)}`}>
                              {getCategoryIcon(note.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{note.note}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{note.created_by}</span>
                                <span>•</span>
                                <span>{format(new Date(note.created_at), "MMM d, yyyy")}</span>
                                <Badge variant="outline" className="text-xs ml-auto">
                                  {note.priority}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Added Today Tab */}
        <TabsContent value="today">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-500" />
                New Members Today
                <Badge variant="outline" className="ml-2">
                  {format(new Date(), "EEEE, MMM d")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayMembers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No new members today yet</p>
                  <p className="text-sm">New sign-ups will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg p-4 border border-amber-500/20">
                      <p className="text-2xl font-bold text-amber-500">
                        {todayMembers.filter((m: Member) => m.membership_type === 'vip').length}
                      </p>
                      <p className="text-sm text-muted-foreground">VIP Members</p>
                      <p className="text-xs text-amber-500/80 mt-1">CHF 149/mo</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-2xl font-bold text-purple-500">
                        {todayMembers.filter((m: Member) => m.membership_type === 'premium').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Premium</p>
                      <p className="text-xs text-purple-500/80 mt-1">CHF 89/mo</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
                      <p className="text-2xl font-bold text-blue-500">
                        {todayMembers.filter((m: Member) => m.membership_type === 'basic').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Basic</p>
                      <p className="text-xs text-blue-500/80 mt-1">CHF 49/mo</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-lg p-4 border border-gray-500/20">
                      <p className="text-2xl font-bold text-gray-500">
                        {todayMembers.filter((m: Member) => m.membership_type === 'trial').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Trial</p>
                      <p className="text-xs text-gray-500/80 mt-1">Free</p>
                    </div>
                  </div>

                  {/* Today's Revenue */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">New MRR Today</p>
                        <p className="text-3xl font-bold text-green-500">
                          CHF {todayMembers.reduce((sum: number, m: Member) => sum + m.monthly_fee, 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Annual Value</p>
                        <p className="text-xl font-semibold text-green-400">
                          CHF {todayMembers.reduce((sum: number, m: Member) => sum + m.monthly_fee * 12, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Member List */}
                  <div className="space-y-3">
                    {todayMembers.map((member: Member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/20 text-primary text-lg">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-lg">{member.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(member.created_at), "HH:mm")} Uhr
                              <span className="mx-1">•</span>
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getMembershipBadge(member.membership_type)}
                          <div className="text-right">
                            <p className="font-semibold">
                              {member.monthly_fee > 0 ? `CHF ${member.monthly_fee}` : 'Free'}
                            </p>
                            <p className="text-xs text-muted-foreground">/month</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                At-Risk Members ({atRiskMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {atRiskMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No at-risk members
                </p>
              ) : (
                <div className="space-y-3">
                  {atRiskMembers.map((member: Member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-destructive/20 text-destructive">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last visit: {formatLastVisit(member.last_visit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(member.activity_status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationCenter members={filteredMembers} />
        </TabsContent>
      </Tabs>

      {/* Member Dialog */}
      <MemberDialog
        open={memberDialogOpen}
        onOpenChange={setMemberDialogOpen}
        member={selectedMember}
        coaches={coaches}
        onSave={handleSaveMember}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        member={selectedMember}
        onConfirm={handleConfirmDelete}
      />

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code for {qrMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrMember && gym?.id && (
              <QRCodeSVG
                value={generateMemberToken(qrMember.id, gym.id)}
                size={256}
                level="M"
                includeMargin
              />
            )}
            <p className="text-sm text-muted-foreground mt-4 text-center">
              This QR code is valid for 5 minutes.
              <br />
              Show it at the terminal to check in.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-orange-500" />
              Add Note for {noteMember?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Note</label>
              <Textarea
                placeholder="e.g., Knee surgery - ask about recovery..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={notePriority} onValueChange={(v) => setNotePriority(v as "low" | "medium" | "high")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={noteCategory} onValueChange={(v) => setNoteCategory(v as "health" | "personal" | "payment" | "other")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={!newNote.trim() || createNoteMutation.isPending}>
              {createNoteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberCRM;
