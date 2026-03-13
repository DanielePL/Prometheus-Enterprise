import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  Users,
  User,
  MapPin,
  Pencil,
  Trash2,
  Flame,
  Dumbbell,
  Zap,
  Target,
  Wind,
  Trophy,
  Timer,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { getWorkoutForSession, getDayOfYear } from "@/services/demoWorkouts";
import { COACH_APP_URL } from "@/config/coachIntegration";
import type { WorkoutBlock } from "@/types/workout";
import type { Session } from "@/types/database";

interface SessionWithRelations extends Session {
  coach?: { id: string; name: string; avatar_url: string | null };
  member?: { id: string; name: string; avatar_url: string | null } | null;
}

interface SessionDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionWithRelations | null;
  onEdit: () => void;
  onDelete: () => void;
}

const SESSION_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  personal: { label: "Personal Training", color: "text-blue-400", bg: "bg-blue-500" },
  group: { label: "Group Class", color: "text-green-400", bg: "bg-green-500" },
  class: { label: "Class", color: "text-purple-400", bg: "bg-purple-500" },
  consultation: { label: "Consultation", color: "text-yellow-400", bg: "bg-yellow-500" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Flame; color: string; bg: string }> = {
  warmup: { label: "Warm-Up", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  strength: { label: "Strength", icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  wod: { label: "WOD", icon: Zap, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  skill: { label: "Skill", icon: Target, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  accessory: { label: "Accessory", icon: Dumbbell, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  cooldown: { label: "Cool Down", icon: Wind, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
};

export default function SessionDetailPanel({
  open,
  onOpenChange,
  session,
  onEdit,
  onDelete,
}: SessionDetailPanelProps) {
  const workout = useMemo(() => {
    if (!session) return [];
    const startTime = parseISO(session.start_time);
    const dayOfYear = getDayOfYear(startTime);
    return getWorkoutForSession(session.title, dayOfYear);
  }, [session]);

  if (!session) return null;

  const startTime = parseISO(session.start_time);
  const endTime = parseISO(session.end_time);
  const durationMin = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
  const typeConfig = SESSION_TYPE_CONFIG[session.session_type] || SESSION_TYPE_CONFIG.personal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Colored header bar */}
        <div className={`${typeConfig.bg} px-6 py-4 flex-shrink-0`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-white text-xl">{session.title}</DialogTitle>
                <p className="text-white/80 text-sm mt-1">
                  {format(startTime, "EEEE, MMMM d", { locale: enUS })}
                </p>
              </div>
              <Badge className="bg-white/20 text-white border-0">
                {typeConfig.label}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-4 space-y-6">
            {/* Session Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{format(startTime, "HH:mm")} – {format(endTime, "HH:mm")}</div>
                  <div className="text-xs text-muted-foreground">{durationMin} min</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{session.coach?.name || "TBD"}</div>
                  <div className="text-xs text-muted-foreground">Coach</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{session.current_participants}/{session.max_participants}</div>
                  <div className="text-xs text-muted-foreground">Participants</div>
                </div>
              </div>
              {session.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{session.location}</div>
                    <div className="text-xs text-muted-foreground">Location</div>
                  </div>
                </div>
              )}
            </div>

            {session.description && (
              <p className="text-sm text-muted-foreground">{session.description}</p>
            )}

            {/* Workout Programming Section */}
            {workout.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Workout Programming
                  </h3>
                  <a
                    href={`${COACH_APP_URL}/workouts`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Open in Coach App
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {workout.map((block) => (
                  <WorkoutBlockCard key={block.id} block={block} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t px-6 py-3 flex items-center justify-between bg-card flex-shrink-0">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Workout Block Card (same as Programming page, but self-contained)
function WorkoutBlockCard({ block }: { block: WorkoutBlock }) {
  const config = CATEGORY_CONFIG[block.category] || CATEGORY_CONFIG.warmup;
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
          {config.label}
        </span>
        {block.wodType && (
          <Badge variant="outline" className="text-xs ml-auto">
            {block.wodType.replace("_", " ").toUpperCase()}
          </Badge>
        )}
      </div>

      <h4 className="font-bold text-base mb-1">{block.title}</h4>

      <div className="flex items-center gap-3 mb-2 text-sm text-muted-foreground">
        {block.rounds && (
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5" />
            {block.rounds}
          </span>
        )}
        {block.timeCap && (
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {block.timeCap}
          </span>
        )}
        {block.scoreType && (
          <span className="text-xs">Score: {block.scoreType}</span>
        )}
      </div>

      {block.description && (
        <p className="text-sm text-muted-foreground mb-2 italic">{block.description}</p>
      )}

      <div className="space-y-1.5">
        {block.movements.map((movement, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-muted-foreground font-mono w-5 text-right flex-shrink-0">
              {idx + 1}.
            </span>
            <div className="flex-1">
              <span className="font-medium">{movement.name}</span>
              {movement.reps && (
                <span className="text-muted-foreground"> — {movement.reps}</span>
              )}
              {movement.weight && (
                <span className={`ml-2 font-semibold ${config.color}`}>
                  @ {movement.weight}
                </span>
              )}
              {movement.notes && (
                <div className="text-xs text-muted-foreground mt-0.5 italic">
                  {movement.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {block.coachNotes && (
        <div className="mt-3 pt-2 border-t border-current/10">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>{block.coachNotes}</span>
          </div>
        </div>
      )}
    </div>
  );
}
