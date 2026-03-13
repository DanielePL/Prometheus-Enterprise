import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { leaderboardService } from "@/services/leaderboard";
import { DEMO_MEMBERS } from "@/services/demoData";
import { isDemoMode } from "@/services/demoData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Trophy,
  Medal,
  Flame,
  TrendingUp,
  Plus,
  Loader2,
  Star,
  Clock,
  Dumbbell,
  Zap,
  ArrowUp,
  Crown,
  Search,
  Timer,
  Weight,
} from "lucide-react";

const SCORE_TYPE_CONFIG: Record<string, { label: string; icon: typeof Clock; unit: string }> = {
  time: { label: "Time", icon: Timer, unit: "" },
  rounds_reps: { label: "Rounds + Reps", icon: Zap, unit: "" },
  load: { label: "Load", icon: Weight, unit: "kg" },
  reps: { label: "Reps", icon: Dumbbell, unit: "reps" },
  calories: { label: "Calories", icon: Flame, unit: "cal" },
  distance: { label: "Distance", icon: TrendingUp, unit: "m" },
  custom: { label: "Custom", icon: Star, unit: "" },
};

const RANK_STYLES = [
  "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/30",     // 1st
  "bg-slate-400/20 text-slate-300 ring-2 ring-slate-400/30",      // 2nd
  "bg-orange-700/20 text-orange-400 ring-2 ring-orange-700/30",   // 3rd
];

export default function Leaderboard() {
  const { gym } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [selectedWorkout, setSelectedWorkout] = useState<string>("");
  const [logScoreOpen, setLogScoreOpen] = useState(false);
  const [searchWorkout, setSearchWorkout] = useState("");

  // Fetch workout names
  const { data: workoutNames = [] } = useQuery({
    queryKey: ["workout-names", gym?.id],
    queryFn: () => (gym ? leaderboardService.getWorkoutNames(gym.id) : []),
    enabled: !!gym?.id,
  });

  // Auto-select first workout
  const currentWorkout = selectedWorkout || workoutNames[0] || "";

  // Fetch leaderboard for selected workout
  const { data: scores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["leaderboard", gym?.id, currentWorkout],
    queryFn: () => (gym && currentWorkout ? leaderboardService.getScoresByWorkout(gym.id, currentWorkout) : []),
    enabled: !!gym?.id && !!currentWorkout,
  });

  // Fetch recent PRs
  const { data: recentPRs = [] } = useQuery({
    queryKey: ["recent-prs", gym?.id],
    queryFn: () => (gym ? leaderboardService.getRecentPRs(gym.id, 15) : []),
    enabled: !!gym?.id,
  });

  // Fetch recent scores feed
  const { data: recentScores = [] } = useQuery({
    queryKey: ["recent-scores", gym?.id],
    queryFn: () => (gym ? leaderboardService.getRecentScores(gym.id, 30) : []),
    enabled: !!gym?.id,
  });

  // Filtered workout list
  const filteredWorkouts = useMemo(() => {
    if (!searchWorkout) return workoutNames;
    return workoutNames.filter((w) => w.toLowerCase().includes(searchWorkout.toLowerCase()));
  }, [workoutNames, searchWorkout]);

  // RX vs Scaled split
  const rxScores = scores.filter((s: any) => s.rx);
  const scaledScores = scores.filter((s: any) => !s.rx);

  if (!gym) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Leaderboard</h1>
          <p className="text-muted-foreground">Scores, PRs & athlete rankings</p>
        </div>
        <Button onClick={() => setLogScoreOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Log Score
        </Button>
      </div>

      {/* PR Banner */}
      {recentPRs.length > 0 && (
        <Card className="backdrop-blur-md bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Recent PRs</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentPRs.slice(0, 6).map((pr: any) => (
                <div
                  key={pr.id}
                  className="flex-shrink-0 bg-card/60 rounded-lg p-3 min-w-[180px] border border-amber-500/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary">
                        {(pr.member?.name || "?").split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{pr.member?.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{pr.workout_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-amber-400">{pr.score_display}</span>
                    {pr.rx && <Badge className="bg-green-500/20 text-green-400 text-[10px] px-1">RX</Badge>}
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* LEADERBOARD TAB */}
        {/* ============================================================ */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Workout Selector */}
            <div className="md:col-span-4 lg:col-span-3 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchWorkout}
                  onChange={(e) => setSearchWorkout(e.target.value)}
                  placeholder="Search workouts..."
                  className="pl-9"
                />
              </div>
              <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:max-h-[500px] md:overflow-y-auto pb-2 md:pb-0">
                {filteredWorkouts.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedWorkout(name)}
                    className={`whitespace-nowrap md:whitespace-normal w-auto md:w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex-shrink-0 ${
                      name === currentWorkout
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted/50 text-foreground/80"
                    }`}
                  >
                    {name}
                  </button>
                ))}
                {filteredWorkouts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No workouts found</p>
                )}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="md:col-span-8 lg:col-span-9">
              {!currentWorkout ? (
                <Card className="backdrop-blur-md bg-card/80">
                  <CardContent className="p-12 text-center">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a workout to see the leaderboard</p>
                  </CardContent>
                </Card>
              ) : scoresLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">{currentWorkout}</h2>

                  {/* RX Leaderboard */}
                  {rxScores.length > 0 && (
                    <Card className="backdrop-blur-md bg-card/80">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-400">RX</Badge>
                          {rxScores.length} athletes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <LeaderboardTable scores={rxScores} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Scaled Leaderboard */}
                  {scaledScores.length > 0 && (
                    <Card className="backdrop-blur-md bg-card/80">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge variant="outline">Scaled</Badge>
                          {scaledScores.length} athletes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <LeaderboardTable scores={scaledScores} />
                      </CardContent>
                    </Card>
                  )}

                  {rxScores.length === 0 && scaledScores.length === 0 && (
                    <Card className="backdrop-blur-md bg-card/80">
                      <CardContent className="p-12 text-center">
                        <p className="text-muted-foreground">No scores logged yet for this workout</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/* ACTIVITY FEED TAB */}
        {/* ============================================================ */}
        <TabsContent value="feed" className="space-y-3">
          {recentScores.length === 0 ? (
            <Card className="backdrop-blur-md bg-card/80">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No scores logged yet</p>
              </CardContent>
            </Card>
          ) : (
            recentScores.map((score: any) => (
              <Card key={score.id} className="backdrop-blur-md bg-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {(score.member?.name || "?").split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{score.member?.name}</span>
                        <span className="text-muted-foreground">logged</span>
                        <span className="font-semibold">{score.workout_name}</span>
                        {score.is_pr && (
                          <Badge className="bg-amber-500/20 text-amber-400 text-xs gap-1">
                            <Trophy className="h-3 w-3" />
                            PR
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="text-lg font-bold text-foreground">{score.score_display}</span>
                        {score.rx ? (
                          <Badge className="bg-green-500/20 text-green-400 text-[10px]">RX</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Scaled</Badge>
                        )}
                        {score.notes && <span className="italic truncate">"{score.notes}"</span>}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {formatDistanceToNow(parseISO(score.recorded_at), { addSuffix: true, locale: enUS })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Log Score Dialog */}
      <LogScoreDialog
        open={logScoreOpen}
        onOpenChange={setLogScoreOpen}
        gymId={gym.id}
        workoutNames={workoutNames}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
          queryClient.invalidateQueries({ queryKey: ["recent-scores"] });
          queryClient.invalidateQueries({ queryKey: ["recent-prs"] });
          queryClient.invalidateQueries({ queryKey: ["workout-names"] });
        }}
      />
    </div>
  );
}

// ============================================================
// Leaderboard Table
// ============================================================

function LeaderboardTable({ scores }: { scores: any[] }) {
  return (
    <div className="divide-y">
      {scores.map((score: any, idx: number) => {
        const rank = idx + 1;
        const isTop3 = rank <= 3;
        return (
          <div
            key={score.id}
            className={`flex items-center gap-4 px-4 py-3 ${isTop3 ? "bg-muted/20" : ""}`}
          >
            {/* Rank */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
              isTop3 ? RANK_STYLES[rank - 1] : "bg-muted/30 text-muted-foreground"
            }`}>
              {rank === 1 ? <Crown className="h-5 w-5" /> : rank}
            </div>

            {/* Athlete */}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/20 text-primary">
                {(score.member?.name || "?").split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{score.member?.name}</div>
              {score.notes && (
                <div className="text-xs text-muted-foreground truncate italic">"{score.notes}"</div>
              )}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className={`text-lg font-bold tabular-nums ${isTop3 ? "text-foreground" : ""}`}>
                  {score.score_display}
                </span>
                {score.is_pr && <Trophy className="h-4 w-4 text-amber-400" />}
              </div>
              {score.scale_notes && (
                <div className="text-xs text-muted-foreground">{score.scale_notes}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Log Score Dialog
// ============================================================

function LogScoreDialog({
  open,
  onOpenChange,
  gymId,
  workoutNames,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gymId: string;
  workoutNames: string[];
  onSuccess: () => void;
}) {
  const [workoutName, setWorkoutName] = useState("");
  const [customWorkoutName, setCustomWorkoutName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [scoreType, setScoreType] = useState<string>("time");
  const [scoreDisplay, setScoreDisplay] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [rx, setRx] = useState(true);
  const [scaleNotes, setScaleNotes] = useState("");
  const [notes, setNotes] = useState("");

  const members = isDemoMode() ? DEMO_MEMBERS : [];

  const logMutation = useMutation({
    mutationFn: async () => {
      const name = workoutName === "__custom" ? customWorkoutName : workoutName;
      if (!name || !memberId || !scoreValue) throw new Error("Missing fields");

      return leaderboardService.logScore({
        gym_id: gymId,
        member_id: memberId,
        workout_name: name,
        score_type: scoreType as any,
        score_value: parseFloat(scoreValue),
        score_display: scoreDisplay || scoreValue,
        rx,
        scaled: !rx,
        scale_notes: !rx ? scaleNotes || null : null,
        notes: notes || null,
      });
    },
    onSuccess: (result) => {
      if (result?.is_pr) {
        toast.success("New PR! Score logged successfully");
      } else {
        toast.success("Score logged");
      }
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setWorkoutName("");
    setCustomWorkoutName("");
    setMemberId("");
    setScoreType("time");
    setScoreDisplay("");
    setScoreValue("");
    setRx(true);
    setScaleNotes("");
    setNotes("");
  };

  // Auto-format time display
  const handleScoreChange = (val: string) => {
    setScoreValue(val);
    if (scoreType === "time" && val) {
      const secs = parseFloat(val);
      if (!isNaN(secs)) {
        const m = Math.floor(secs / 60);
        const s = Math.round(secs % 60);
        setScoreDisplay(`${m}:${s.toString().padStart(2, "0")}`);
      }
    } else if (scoreType === "load" && val) {
      setScoreDisplay(`${val} kg`);
    } else {
      setScoreDisplay(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member */}
          <div className="space-y-2">
            <Label>Athlete *</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Select athlete" />
              </SelectTrigger>
              <SelectContent>
                {members.map((m: any) => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workout */}
          <div className="space-y-2">
            <Label>Workout *</Label>
            <Select value={workoutName} onValueChange={setWorkoutName}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout" />
              </SelectTrigger>
              <SelectContent>
                {workoutNames.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
                <SelectItem value="__custom">+ Custom workout</SelectItem>
              </SelectContent>
            </Select>
            {workoutName === "__custom" && (
              <Input
                value={customWorkoutName}
                onChange={(e) => setCustomWorkoutName(e.target.value)}
                placeholder="Workout name"
              />
            )}
          </div>

          {/* Score Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Score Type *</Label>
              <Select value={scoreType} onValueChange={setScoreType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SCORE_TYPE_CONFIG).map(([val, cfg]) => (
                    <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                Score * {scoreType === "time" ? "(seconds)" : scoreType === "load" ? "(kg)" : ""}
              </Label>
              <Input
                type="number"
                step="any"
                value={scoreValue}
                onChange={(e) => handleScoreChange(e.target.value)}
                placeholder={scoreType === "time" ? "e.g. 222 (3:42)" : scoreType === "load" ? "e.g. 115" : "Score"}
              />
            </div>
          </div>

          {/* Display */}
          <div className="space-y-2">
            <Label>Display Value</Label>
            <Input
              value={scoreDisplay}
              onChange={(e) => setScoreDisplay(e.target.value)}
              placeholder="How it appears on the board (e.g. 3:42, 23+10, 115 kg)"
            />
          </div>

          {/* RX / Scaled */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={rx ? "default" : "outline"}
              size="sm"
              onClick={() => setRx(true)}
              className="gap-1"
            >
              <Zap className="h-3.5 w-3.5" />
              RX
            </Button>
            <Button
              type="button"
              variant={!rx ? "default" : "outline"}
              size="sm"
              onClick={() => setRx(false)}
              className="gap-1"
            >
              Scaled
            </Button>
          </div>

          {!rx && (
            <div className="space-y-2">
              <Label>Scale Notes</Label>
              <Input
                value={scaleNotes}
                onChange={(e) => setScaleNotes(e.target.value)}
                placeholder="e.g. 30kg Thrusters, banded PU"
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => logMutation.mutate()}
            disabled={logMutation.isPending || !memberId || (!workoutName || (workoutName === "__custom" && !customWorkoutName)) || !scoreValue}
          >
            {logMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Log Score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
