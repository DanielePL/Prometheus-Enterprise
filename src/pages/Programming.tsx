import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { sessionsService } from "@/services/sessions";
import { workoutTemplatesService } from "@/services/workoutTemplates";
import { getWorkoutForSession, getDayOfYear } from "@/services/demoWorkouts";
import { isDemoMode } from "@/services/demoData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  User,
  Flame,
  Dumbbell,
  Zap,
  Target,
  Wind,
  Loader2,
  Monitor,
  Trophy,
  Timer,
  MessageSquare,
  Plus,
  Pencil,
  Library,
  X,
  GripVertical,
  Trash2,
  Copy,
  Search,
  BookOpen,
  Save,
} from "lucide-react";
import type { WorkoutBlock, WorkoutMovement } from "@/types/workout";

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Flame; color: string; bg: string }> = {
  warmup: { label: "Warm-Up", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  strength: { label: "Strength", icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  wod: { label: "WOD", icon: Zap, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  skill: { label: "Skill", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  accessory: { label: "Accessory", icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  cooldown: { label: "Cool Down", icon: Wind, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  personal: "bg-blue-500",
  group: "bg-green-500",
  class: "bg-purple-500",
  consultation: "bg-yellow-500",
};

const CATEGORIES = [
  { value: "warmup", label: "Warm-Up" },
  { value: "strength", label: "Strength" },
  { value: "wod", label: "WOD" },
  { value: "skill", label: "Skill" },
  { value: "accessory", label: "Accessory" },
  { value: "cooldown", label: "Cool Down" },
];

const WOD_TYPES = [
  { value: "amrap", label: "AMRAP" },
  { value: "emom", label: "EMOM" },
  { value: "for_time", label: "For Time" },
  { value: "rounds", label: "Rounds" },
  { value: "tabata", label: "Tabata" },
  { value: "chipper", label: "Chipper" },
  { value: "custom", label: "Custom" },
];

// ============================================================
// Helper: get workout for a session (DB data or demo fallback)
// ============================================================

function getSessionWorkout(session: any, dayOfYear: number): WorkoutBlock[] {
  // If session has stored workout_data, use it
  if (session.workout_data && Array.isArray(session.workout_data) && session.workout_data.length > 0) {
    return session.workout_data as WorkoutBlock[];
  }
  // Demo fallback
  if (isDemoMode()) {
    return getWorkoutForSession(session.title, dayOfYear);
  }
  return [];
}

// ============================================================
// Main Component
// ============================================================

export default function Programming() {
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [tvMode, setTvMode] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [editingBlocks, setEditingBlocks] = useState<WorkoutBlock[]>([]);

  const dateKey = format(selectedDate, "yyyy-MM-dd");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions-programming", gym?.id, dateKey],
    queryFn: () =>
      gym
        ? sessionsService.getByDateRange(gym.id, startOfDay(selectedDate), endOfDay(selectedDate))
        : [],
    enabled: !!gym?.id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["workout-templates", gym?.id],
    queryFn: () => (gym ? workoutTemplatesService.getAll(gym.id) : []),
    enabled: !!gym?.id,
  });

  const saveWorkoutMutation = useMutation({
    mutationFn: async ({ sessionId, blocks }: { sessionId: string; blocks: WorkoutBlock[] }) => {
      await workoutTemplatesService.saveSessionWorkout(sessionId, blocks);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions-programming"] });
      toast.success("Workout saved");
      setEditingSession(null);
      setEditingBlocks([]);
    },
  });

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [sessions]
  );

  const dayOfYear = getDayOfYear(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());
  const now = new Date();

  const navigateDate = (direction: "prev" | "next") => {
    setSelectedDate((d) => (direction === "prev" ? subDays(d, 1) : addDays(d, 1)));
    setExpandedSession(null);
  };

  const startEditing = (session: any) => {
    const existing = getSessionWorkout(session, dayOfYear);
    setEditingSession(session);
    setEditingBlocks(existing.length > 0 ? JSON.parse(JSON.stringify(existing)) : []);
  };

  const addBlockFromTemplate = (template: any) => {
    const block = workoutTemplatesService.templateToBlock(template);
    block.id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setEditingBlocks((prev) => [...prev, block]);
    setTemplatePickerOpen(false);
  };

  const addEmptyBlock = (category: string) => {
    const block: WorkoutBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: category as WorkoutBlock["category"],
      title: "",
      movements: [{ name: "" }],
    };
    setEditingBlocks((prev) => [...prev, block]);
  };

  const removeBlock = (blockId: string) => {
    setEditingBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const updateBlock = (blockId: string, updates: Partial<WorkoutBlock>) => {
    setEditingBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    );
  };

  const moveBlock = (blockId: string, direction: "up" | "down") => {
    setEditingBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx < 0) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  const handleSave = () => {
    if (!editingSession) return;
    if (isDemoMode()) {
      toast.success("Workout saved (demo mode)");
      setEditingSession(null);
      setEditingBlocks([]);
      return;
    }
    saveWorkoutMutation.mutate({ sessionId: editingSession.id, blocks: editingBlocks });
  };

  if (!gym) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tvMode) {
    return (
      <TVWhiteboard
        sessions={sortedSessions}
        selectedDate={selectedDate}
        dayOfYear={dayOfYear}
        onExit={() => setTvMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Programming</h1>
          <p className="text-muted-foreground">Daily workout programming & whiteboard</p>
        </div>
        <Button variant="outline" onClick={() => setTvMode(true)} className="gap-2">
          <Monitor className="h-4 w-4" />
          TV / Whiteboard Mode
        </Button>
      </div>

      {/* Date Navigation */}
      <Card className="backdrop-blur-md bg-card/80">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Button
                variant={isToday ? "default" : "outline"}
                onClick={() => { setSelectedDate(new Date()); setExpandedSession(null); }}
              >
                Today
              </Button>
              <div className="text-center">
                <div className="text-lg font-bold">{format(selectedDate, "EEEE", { locale: enUS })}</div>
                <div className="text-sm text-muted-foreground">{format(selectedDate, "MMMM d, yyyy", { locale: enUS })}</div>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions with Workouts */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : sortedSessions.length === 0 ? (
        <Card className="backdrop-blur-md bg-card/80">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground text-lg">No sessions scheduled for this day</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((session) => {
            const startTime = parseISO(session.start_time);
            const endTime = parseISO(session.end_time);
            const isPast = startTime < now;
            const isActive = startTime <= now && endTime > now;
            const isExpanded = expandedSession === session.id;
            const workout = getSessionWorkout(session, dayOfYear);
            const hasWorkout = workout.length > 0;

            return (
              <Card
                key={session.id}
                className={`backdrop-blur-md bg-card/80 overflow-hidden transition-all ${
                  isActive ? "ring-2 ring-primary shadow-lg shadow-primary/20" : ""
                } ${isPast && !isActive ? "opacity-70" : ""}`}
              >
                {/* Session Header */}
                <div
                  className="p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                >
                  <div className="flex-shrink-0 w-20 text-center">
                    <div className="text-2xl font-bold tabular-nums">{format(startTime, "HH:mm")}</div>
                    <div className="text-xs text-muted-foreground">{format(endTime, "HH:mm")}</div>
                  </div>
                  <div className={`w-1 h-14 rounded-full ${SESSION_TYPE_COLORS[session.session_type] || "bg-gray-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold truncate">{session.title}</h3>
                      {isActive && <Badge className="bg-primary/20 text-primary text-xs animate-pulse">LIVE</Badge>}
                      {session.status === "completed" && <Badge className="bg-green-500/20 text-green-400 text-xs">Done</Badge>}
                      {!hasWorkout && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">No workout</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {(session as any).coach?.name || "TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {session.current_participants}/{session.max_participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {Math.round((endTime.getTime() - startTime.getTime()) / 60000)} min
                      </span>
                    </div>
                  </div>

                  {/* WOD Preview Badges */}
                  <div className="hidden md:flex items-center gap-2">
                    {workout
                      .filter((b) => b.category === "wod" || b.category === "strength")
                      .slice(0, 2)
                      .map((block) => {
                        const config = CATEGORY_CONFIG[block.category];
                        return (
                          <Badge key={block.id} variant="outline" className={`${config.bg} border ${config.color} text-xs`}>
                            {block.title}
                          </Badge>
                        );
                      })}
                  </div>

                  {/* Edit Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); startEditing(session); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                {/* Expanded Workout Detail */}
                {isExpanded && hasWorkout && (
                  <div className="border-t bg-muted/30 p-4 space-y-4">
                    {workout.map((block) => (
                      <WorkoutBlockCard key={block.id} block={block} />
                    ))}
                  </div>
                )}

                {/* Expanded: No workout prompt */}
                {isExpanded && !hasWorkout && (
                  <div className="border-t bg-muted/30 p-6 text-center">
                    <p className="text-muted-foreground mb-3">No workout programmed yet</p>
                    <Button variant="outline" onClick={() => startEditing(session)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Workout
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* WORKOUT EDITOR DIALOG */}
      {/* ============================================================ */}
      <Dialog open={!!editingSession} onOpenChange={(open) => { if (!open) { setEditingSession(null); setEditingBlocks([]); } }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Workout — {editingSession?.title}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {editingSession && format(parseISO(editingSession.start_time), "HH:mm")}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Block List */}
            {editingBlocks.map((block, idx) => (
              <EditableBlock
                key={block.id}
                block={block}
                index={idx}
                total={editingBlocks.length}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onRemove={() => removeBlock(block.id)}
                onMove={(dir) => moveBlock(block.id, dir)}
              />
            ))}

            {/* Add Block Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setTemplatePickerOpen(true)} className="gap-1">
                <Library className="h-3.5 w-3.5" />
                From Template
              </Button>
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => addEmptyBlock(cat.value)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingSession(null); setEditingBlocks([]); }}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveWorkoutMutation.isPending} className="gap-2">
              {saveWorkoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* TEMPLATE PICKER DIALOG */}
      {/* ============================================================ */}
      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        templates={templates}
        onSelect={addBlockFromTemplate}
      />
    </div>
  );
}

// ============================================================
// Editable Block Component
// ============================================================

function EditableBlock({
  block,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  block: WorkoutBlock;
  index: number;
  total: number;
  onUpdate: (updates: Partial<WorkoutBlock>) => void;
  onRemove: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const config = CATEGORY_CONFIG[block.category] || CATEGORY_CONFIG.warmup;

  const updateMovement = (idx: number, updates: Partial<WorkoutMovement>) => {
    const newMovements = [...block.movements];
    newMovements[idx] = { ...newMovements[idx], ...updates };
    onUpdate({ movements: newMovements });
  };

  const addMovement = () => {
    onUpdate({ movements: [...block.movements, { name: "" }] });
  };

  const removeMovement = (idx: number) => {
    onUpdate({ movements: block.movements.filter((_, i) => i !== idx) });
  };

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      {/* Block Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col gap-0.5">
          <button
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={() => onMove("up")}
            disabled={index === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5 rotate-90" />
          </button>
          <button
            className="text-muted-foreground hover:text-foreground disabled:opacity-30"
            onClick={() => onMove("down")}
            disabled={index === total - 1}
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-90" />
          </button>
        </div>

        <Select value={block.category} onValueChange={(v) => onUpdate({ category: v as WorkoutBlock["category"] })}>
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={block.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Block title (e.g. Fran, Back Squat)"
          className="h-8 text-sm font-semibold flex-1"
        />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* WOD-specific fields */}
      {(block.category === "wod") && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <Label className="text-xs">WOD Type</Label>
            <Select value={block.wodType || ""} onValueChange={(v) => onUpdate({ wodType: v as WorkoutBlock["wodType"] })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {WOD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Time Cap</Label>
            <Input
              value={block.timeCap || ""}
              onChange={(e) => onUpdate({ timeCap: e.target.value })}
              placeholder="e.g. 12 min"
              className="h-8 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Rounds</Label>
            <Input
              value={block.rounds || ""}
              onChange={(e) => onUpdate({ rounds: e.target.value })}
              placeholder="e.g. 21-15-9"
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Description */}
      <Input
        value={block.description || ""}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Description (optional)"
        className="h-8 text-xs mb-3"
      />

      {/* Movements */}
      <div className="space-y-2">
        {block.movements.map((mov, idx) => (
          <div key={idx} className="flex flex-wrap md:flex-nowrap items-center gap-1.5 md:gap-2">
            <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}.</span>
            <Input
              value={mov.name}
              onChange={(e) => updateMovement(idx, { name: e.target.value })}
              placeholder="Movement name"
              className="h-7 text-xs flex-1 min-w-[120px]"
            />
            <Input
              value={mov.reps || ""}
              onChange={(e) => updateMovement(idx, { reps: e.target.value })}
              placeholder="Reps"
              className="h-7 text-xs w-16 md:w-24"
            />
            <Input
              value={mov.weight || ""}
              onChange={(e) => updateMovement(idx, { weight: e.target.value })}
              placeholder="Weight"
              className="h-7 text-xs w-16 md:w-28"
            />
            <Input
              value={mov.notes || ""}
              onChange={(e) => updateMovement(idx, { notes: e.target.value })}
              placeholder="Notes"
              className="h-7 text-xs w-20 md:w-32 hidden sm:block"
            />
            <button
              className="text-muted-foreground hover:text-destructive flex-shrink-0"
              onClick={() => removeMovement(idx)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addMovement} className="text-xs gap-1 h-7">
          <Plus className="h-3 w-3" />
          Movement
        </Button>
      </div>

      {/* Coach Notes */}
      <div className="mt-3 pt-2 border-t border-current/10">
        <Input
          value={block.coachNotes || ""}
          onChange={(e) => onUpdate({ coachNotes: e.target.value })}
          placeholder="Coach notes (internal)"
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}

// ============================================================
// Template Picker Dialog
// ============================================================

function TemplatePicker({
  open,
  onOpenChange,
  templates,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: any[];
  onSelect: (template: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase())));
      const matchesCategory = filterCategory === "all" || t.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, search, filterCategory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            Workout Templates
          </DialogTitle>
        </DialogHeader>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Template List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No templates found</p>
          ) : (
            filtered.map((template) => {
              const config = CATEGORY_CONFIG[template.category] || CATEGORY_CONFIG.warmup;
              const Icon = config.icon;
              return (
                <div
                  key={template.id}
                  className={`rounded-lg border p-3 cursor-pointer hover:ring-2 hover:ring-primary transition-all ${config.bg}`}
                  onClick={() => onSelect(template)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{template.name}</span>
                        {template.is_benchmark && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs">Benchmark</Badge>
                        )}
                        {template.wod_type && (
                          <Badge variant="outline" className="text-xs">
                            {template.wod_type.replace("_", " ").toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {(template.movements as any[])?.map((m: any) => m.name).join(" · ")}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>Used {template.usage_count}x</div>
                      {template.time_cap && <div>{template.time_cap}</div>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Workout Block Card (read-only display)
// ============================================================

function WorkoutBlockCard({ block }: { block: WorkoutBlock }) {
  const config = CATEGORY_CONFIG[block.category] || CATEGORY_CONFIG.warmup;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>{config.label}</span>
        {block.wodType && (
          <Badge variant="outline" className="text-xs ml-auto">
            {block.wodType.replace("_", " ").toUpperCase()}
          </Badge>
        )}
      </div>

      <h4 className="font-bold text-xl mb-1">{block.title}</h4>

      <div className="flex items-center gap-3 mb-3 text-sm text-muted-foreground">
        {block.rounds && (
          <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />{block.rounds}</span>
        )}
        {block.timeCap && (
          <span className="flex items-center gap-1"><Timer className="h-3.5 w-3.5" />{block.timeCap}</span>
        )}
        {block.scoreType && <span className="text-xs">Score: {block.scoreType}</span>}
      </div>

      {block.description && <p className="text-sm text-muted-foreground mb-3 italic">{block.description}</p>}

      <div className="space-y-2">
        {block.movements.map((movement, idx) => (
          <div key={idx} className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground font-mono w-5 text-right flex-shrink-0">{idx + 1}.</span>
            <div className="flex-1">
              <span className="font-medium">{movement.name}</span>
              {movement.reps && <span className="text-muted-foreground"> — {movement.reps}</span>}
              {movement.weight && <span className={`ml-2 font-semibold ${config.color}`}>@ {movement.weight}</span>}
              {movement.notes && <div className="text-xs text-muted-foreground mt-0.5 italic">{movement.notes}</div>}
            </div>
          </div>
        ))}
      </div>

      {block.coachNotes && (
        <div className="mt-3 pt-3 border-t border-current/10">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{block.coachNotes}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TV / Whiteboard Mode
// ============================================================

function TVWhiteboard({
  sessions,
  selectedDate,
  dayOfYear,
  onExit,
}: {
  sessions: any[];
  selectedDate: Date;
  dayOfYear: number;
  onExit: () => void;
}) {
  const now = new Date();

  const activeSession = sessions.find((s) => {
    const start = parseISO(s.start_time);
    const end = parseISO(s.end_time);
    return start <= now && end > now;
  });

  const nextSession = sessions.find((s) => parseISO(s.start_time) > now);
  const featuredSession = activeSession || nextSession || sessions[0];
  const featuredWorkout = featuredSession ? getSessionWorkout(featuredSession, dayOfYear) : [];

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto" onClick={onExit}>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg">
              <Flame className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight">{format(selectedDate, "EEEE", { locale: enUS })}</h1>
              <p className="text-sm lg:text-lg text-muted-foreground">{format(selectedDate, "MMMM d, yyyy", { locale: enUS })}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl md:text-4xl lg:text-5xl font-black tabular-nums">{format(now, "HH:mm")}</div>
            <p className="text-xs lg:text-sm text-muted-foreground mt-1">Click anywhere to exit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          <div className="md:col-span-4 space-y-2">
            <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider mb-4">Schedule</h2>
            {sessions.map((session) => {
              const startTime = parseISO(session.start_time);
              const endTime = parseISO(session.end_time);
              const isPast = endTime < now;
              const isActive = startTime <= now && endTime > now;
              const isFeatured = session.id === featuredSession?.id;

              return (
                <div
                  key={session.id}
                  className={`rounded-xl p-4 transition-all ${
                    isFeatured ? "bg-primary/20 ring-2 ring-primary shadow-lg" : isPast ? "bg-muted/30 opacity-50" : "bg-card/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center w-16">
                      <div className={`text-lg font-bold tabular-nums ${isFeatured ? "text-primary" : ""}`}>
                        {format(startTime, "HH:mm")}
                      </div>
                    </div>
                    <div className={`w-1 h-10 rounded-full ${SESSION_TYPE_COLORS[session.session_type] || "bg-gray-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isFeatured ? "text-primary" : ""}`}>{session.title}</span>
                        {isActive && <Badge className="bg-primary text-primary-foreground text-xs animate-pulse">NOW</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{session.coach?.name}</span>
                        <span>·</span>
                        <span>{session.current_participants}/{session.max_participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="md:col-span-8 space-y-4">
            {featuredSession && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">
                    {activeSession ? "Current" : "Up Next"} — {featuredSession.title}
                  </h2>
                  <span className="text-lg text-muted-foreground">
                    {format(parseISO(featuredSession.start_time), "HH:mm")} - {format(parseISO(featuredSession.end_time), "HH:mm")}
                  </span>
                </div>
                {featuredWorkout.map((block) => (
                  <WorkoutBlockCard key={block.id} block={block} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
