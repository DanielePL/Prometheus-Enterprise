import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday as isDateToday,
  addDays,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Clock,
  Palmtree,
  AlertTriangle,
  Zap,
  Coffee,
  Cake,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { sessionsService } from "@/services/sessions";
import type { Coach } from "@/types/database";

type ViewMode = "day" | "week";

interface SessionWithRelations {
  id: string;
  coach_id: string;
  title: string;
  session_type: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  max_participants: number;
  current_participants: number;
  coach?: { id: string; name: string; avatar_url: string | null };
}

// Coach color assignments
const COACH_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  c1: { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500/40", light: "bg-blue-500/10" },
  c2: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/40", light: "bg-emerald-500/10" },
  c3: { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/40", light: "bg-orange-500/10" },
  c4: { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500/40", light: "bg-purple-500/10" },
  c5: { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/40", light: "bg-rose-500/10" },
  c6: { bg: "bg-cyan-500", text: "text-cyan-400", border: "border-cyan-500/40", light: "bg-cyan-500/10" },
};

function getCoachColor(coachId: string, index: number) {
  return COACH_COLORS[coachId] || Object.values(COACH_COLORS)[index % Object.values(COACH_COLORS).length];
}

// Session type styling
const SESSION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  personal: { label: "Personal", color: "bg-blue-600" },
  group: { label: "Group", color: "bg-green-600" },
  class: { label: "Class", color: "bg-purple-600" },
  consultation: { label: "Consult", color: "bg-yellow-600" },
};

// Demo time-off data
function getCoachTimeOff(coachId: string): Array<{ date: string; reason: string }> {
  const today = new Date();
  const timeOffs: Record<string, Array<{ daysFromNow: number; reason: string }>> = {
    c1: [{ daysFromNow: 3, reason: "Weiterbildung CrossFit L4" }],
    c4: [{ daysFromNow: 1, reason: "Yoga Retreat" }, { daysFromNow: 2, reason: "Yoga Retreat" }],
    c6: [{ daysFromNow: 0, reason: "Elternzeit" }, { daysFromNow: 1, reason: "Elternzeit" }, { daysFromNow: 2, reason: "Elternzeit" }, { daysFromNow: 3, reason: "Elternzeit" }, { daysFromNow: 4, reason: "Elternzeit" }],
  };

  const entries = timeOffs[coachId] || [];
  return entries.map((e) => ({
    date: addDays(today, e.daysFromNow).toISOString().slice(0, 10),
    reason: e.reason,
  }));
}

// Demo member birthdays assigned to coaches
function getCoachBirthdays(coachId: string): Array<{ date: string; memberName: string }> {
  const today = new Date();
  const birthdays: Record<string, Array<{ daysFromNow: number; memberName: string }>> = {
    c1: [{ daysFromNow: 0, memberName: "Laura Zimmermann" }],
    c2: [{ daysFromNow: 2, memberName: "Lea Bachmann" }],
    c5: [{ daysFromNow: 4, memberName: "David Steiner" }],
  };

  const entries = birthdays[coachId] || [];
  return entries.map((e) => ({
    date: addDays(today, e.daysFromNow).toISOString().slice(0, 10),
    memberName: e.memberName,
  }));
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

interface CoachCalendarProps {
  coaches: Coach[];
}

export default function CoachCalendar({ coaches }: CoachCalendarProps) {
  const { gym } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedCoachFilter, setSelectedCoachFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

  const activeCoaches = useMemo(
    () => coaches.filter((c) => c.is_active),
    [coaches]
  );

  const filteredCoaches = useMemo(() => {
    if (selectedCoachFilter === "all") return activeCoaches;
    return activeCoaches.filter((c) => c.id === selectedCoachFilter);
  }, [activeCoaches, selectedCoachFilter]);

  // Week range
  const weekRange = useMemo(() => ({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  }), [currentDate]);

  const weekDays = useMemo(() => eachDayOfInterval(weekRange), [weekRange]);

  // Fetch sessions for the week
  const { data: sessions = [] } = useQuery({
    queryKey: ["coach-calendar-sessions", gym?.id, weekRange.start, weekRange.end],
    queryFn: () =>
      gym ? sessionsService.getByDateRange(gym.id, weekRange.start, weekRange.end) : [],
    enabled: !!gym?.id,
  });

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  // Get sessions for a specific coach and day/hour
  const getCoachSessionsForSlot = (coachId: string, date: Date, hour: number): SessionWithRelations[] => {
    return sessions.filter((s) => {
      const start = parseISO(s.start_time);
      return s.coach_id === coachId && isSameDay(start, date) && start.getHours() === hour;
    }) as SessionWithRelations[];
  };

  const getCoachSessionsForDay = (coachId: string, date: Date): SessionWithRelations[] => {
    return sessions.filter((s) => {
      const start = parseISO(s.start_time);
      return s.coach_id === coachId && isSameDay(start, date);
    }) as SessionWithRelations[];
  };

  // Detect double-bookings
  const getConflicts = (date: Date): Array<{ coachId: string; hour: number; sessions: SessionWithRelations[] }> => {
    const conflicts: Array<{ coachId: string; hour: number; sessions: SessionWithRelations[] }> = [];
    for (const coach of filteredCoaches) {
      for (const hour of HOURS) {
        const slotSessions = getCoachSessionsForSlot(coach.id, date, hour);
        if (slotSessions.length > 1) {
          conflicts.push({ coachId: coach.id, hour, sessions: slotSessions });
        }
      }
    }
    return conflicts;
  };

  // Coach summary stats for current week
  const getCoachWeekStats = (coachId: string) => {
    const coachSessions = sessions.filter((s) => s.coach_id === coachId) as SessionWithRelations[];
    const totalSessions = coachSessions.length;
    const totalHours = totalSessions; // ~1h per session
    const revenue = coachSessions.reduce((sum, s) => sum + (s.price || 0) * (s.current_participants || 1), 0);
    const participants = coachSessions.reduce((sum, s) => sum + (s.current_participants || 0), 0);
    return { totalSessions, totalHours, revenue, participants };
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={goToToday} className="text-sm">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-2 text-lg font-medium">
                {format(weekRange.start, "MMM d", { locale: enUS })} –{" "}
                {format(weekRange.end, "MMM d, yyyy", { locale: enUS })}
              </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={selectedCoachFilter} onValueChange={setSelectedCoachFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter coach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coaches</SelectItem>
                  {activeCoaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coach Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {filteredCoaches.map((coach, idx) => {
          const color = getCoachColor(coach.id, idx);
          const stats = getCoachWeekStats(coach.id);
          const timeOff = getCoachTimeOff(coach.id);
          const hasTimeOffThisWeek = timeOff.some((t) =>
            weekDays.some((d) => d.toISOString().slice(0, 10) === t.date)
          );

          return (
            <Card
              key={coach.id}
              className={`glass-card cursor-pointer transition-all hover:scale-[1.02] ${
                selectedCoachFilter === coach.id ? `ring-2 ring-offset-2 ring-offset-background ${color.border.replace("/40", "")}` : ""
              }`}
              onClick={() =>
                setSelectedCoachFilter(selectedCoachFilter === coach.id ? "all" : coach.id)
              }
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className={`${color.bg} text-white text-xs`}>
                      {coach.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{coach.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {coach.specializations?.[0] || "Coach"}
                    </p>
                  </div>
                  {hasTimeOffThisWeek && (
                    <Palmtree className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                  )}
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div>
                    <p className="text-sm font-semibold">{stats.totalSessions}</p>
                    <p className="text-[10px] text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{stats.participants}</p>
                    <p className="text-[10px] text-muted-foreground">Athletes</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {stats.revenue > 999
                        ? `${(stats.revenue / 1000).toFixed(1)}k`
                        : stats.revenue}
                    </p>
                    <p className="text-[10px] text-muted-foreground">CHF</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Calendar Grid */}
      {viewMode === "week" ? (
        <WeekResourceView
          coaches={filteredCoaches}
          weekDays={weekDays}
          sessions={sessions as SessionWithRelations[]}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          getCoachSessionsForSlot={getCoachSessionsForSlot}
          getConflicts={getConflicts}
        />
      ) : (
        <DayResourceView
          coaches={filteredCoaches}
          day={selectedDay}
          sessions={sessions as SessionWithRelations[]}
          getCoachSessionsForSlot={getCoachSessionsForSlot}
          getConflicts={getConflicts}
          onNavigateDay={(dir) =>
            setSelectedDay(addDays(selectedDay, dir === "prev" ? -1 : 1))
          }
        />
      )}
    </div>
  );
}

// ─── Week Resource View (days as rows, coaches as columns) ─────────────

function WeekResourceView({
  coaches,
  weekDays,
  sessions,
  selectedDay,
  onSelectDay,
  getCoachSessionsForSlot,
  getConflicts,
}: {
  coaches: Coach[];
  weekDays: Date[];
  sessions: SessionWithRelations[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  getCoachSessionsForSlot: (coachId: string, date: Date, hour: number) => SessionWithRelations[];
  getConflicts: (date: Date) => Array<{ coachId: string; hour: number; sessions: SessionWithRelations[] }>;
}) {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground w-[120px] sticky left-0 bg-card z-10">
                Day
              </th>
              {coaches.map((coach, idx) => {
                const color = getCoachColor(coach.id, idx);
                return (
                  <th key={coach.id} className="p-3 text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`${color.bg} text-white text-xs`}>
                          {coach.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{coach.name.split(" ")[0]}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {weekDays.map((day) => {
              const isToday = isDateToday(day);
              const dayConflicts = getConflicts(day);
              const dayStr = day.toISOString().slice(0, 10);

              return (
                <tr
                  key={day.toISOString()}
                  className={`border-b last:border-b-0 cursor-pointer hover:bg-muted/20 transition-colors ${
                    isToday ? "bg-primary/5" : ""
                  } ${isSameDay(day, selectedDay) ? "ring-1 ring-inset ring-primary/30" : ""}`}
                  onClick={() => onSelectDay(day)}
                >
                  <td className="p-3 sticky left-0 bg-card z-10 border-r">
                    <div className="text-sm font-medium">
                      {format(day, "EEE", { locale: enUS })}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        isToday ? "text-primary" : ""
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    {dayConflicts.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="destructive" className="text-[10px] mt-1 px-1">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                              {dayConflicts.length} conflict{dayConflicts.length > 1 ? "s" : ""}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {dayConflicts.map((c, i) => (
                              <div key={i} className="text-xs">
                                {coaches.find((co) => co.id === c.coachId)?.name} at {c.hour}:00 – {c.sessions.length} sessions
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </td>
                  {coaches.map((coach, idx) => {
                    const color = getCoachColor(coach.id, idx);
                    const daySessions = sessions
                      .filter((s) => s.coach_id === coach.id && isSameDay(parseISO(s.start_time), day))
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));

                    const timeOff = getCoachTimeOff(coach.id);
                    const isOff = timeOff.some((t) => t.date === dayStr);
                    const offReason = timeOff.find((t) => t.date === dayStr)?.reason;

                    const birthdays = getCoachBirthdays(coach.id);
                    const birthday = birthdays.find((b) => b.date === dayStr);

                    return (
                      <td
                        key={coach.id}
                        className={`p-2 border-r last:border-r-0 align-top ${
                          isOff ? "bg-yellow-500/5" : ""
                        }`}
                      >
                        {isOff ? (
                          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                            <Palmtree className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                            <span className="text-xs text-yellow-500 font-medium truncate">
                              {offReason || "Time Off"}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {birthday && (
                              <div className="flex items-center gap-1 p-1.5 rounded-md bg-pink-500/10 border border-pink-500/20 mb-1">
                                <Cake className="h-3 w-3 text-pink-400 shrink-0" />
                                <span className="text-[10px] text-pink-400 truncate">
                                  {birthday.memberName}
                                </span>
                              </div>
                            )}
                            {daySessions.length === 0 && !birthday ? (
                              <div className="flex items-center gap-1 p-2 text-muted-foreground/40">
                                <Coffee className="h-3 w-3" />
                                <span className="text-xs">Free</span>
                              </div>
                            ) : (
                              daySessions.map((session) => {
                                const startTime = format(parseISO(session.start_time), "HH:mm");
                                const endTime = format(parseISO(session.end_time), "HH:mm");
                                const typeConfig = SESSION_TYPE_CONFIG[session.session_type];
                                const isConflict = daySessions.filter(
                                  (s) => parseISO(s.start_time).getHours() === parseISO(session.start_time).getHours()
                                ).length > 1;

                                return (
                                  <TooltipProvider key={session.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`rounded-md p-1.5 border cursor-pointer hover:opacity-90 transition-opacity ${
                                            isConflict
                                              ? "border-red-500/50 bg-red-500/10"
                                              : `${color.border} ${color.light}`
                                          }`}
                                        >
                                          <div className="flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${typeConfig?.color || "bg-gray-500"} shrink-0`} />
                                            <span className="text-xs font-medium truncate">
                                              {session.title}
                                            </span>
                                            {isConflict && (
                                              <AlertTriangle className="h-2.5 w-2.5 text-red-400 shrink-0" />
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-muted-foreground">
                                              {startTime}–{endTime}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                              {session.session_type === "personal" ? (
                                                <User className="h-2.5 w-2.5" />
                                              ) : (
                                                <Users className="h-2.5 w-2.5" />
                                              )}
                                              {session.current_participants}/{session.max_participants}
                                            </span>
                                          </div>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="max-w-[200px]">
                                        <div className="space-y-1">
                                          <p className="font-medium">{session.title}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {startTime} – {endTime}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[10px]">
                                              {typeConfig?.label || session.session_type}
                                            </Badge>
                                            <span className="text-xs">CHF {session.price}</span>
                                          </div>
                                          <p className="text-xs">
                                            {session.current_participants}/{session.max_participants} participants
                                          </p>
                                          {isConflict && (
                                            <p className="text-xs text-red-400 font-medium">
                                              Scheduling conflict!
                                            </p>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                );
                              })
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Day Resource View (hours as rows, coaches as columns) ─────────────

function DayResourceView({
  coaches,
  day,
  sessions,
  getCoachSessionsForSlot,
  getConflicts,
  onNavigateDay,
}: {
  coaches: Coach[];
  day: Date;
  sessions: SessionWithRelations[];
  getCoachSessionsForSlot: (coachId: string, date: Date, hour: number) => SessionWithRelations[];
  getConflicts: (date: Date) => Array<{ coachId: string; hour: number; sessions: SessionWithRelations[] }>;
  onNavigateDay: (dir: "prev" | "next") => void;
}) {
  const isToday = isDateToday(day);
  const dayConflicts = getConflicts(day);
  const dayStr = day.toISOString().slice(0, 10);
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-3">
      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onNavigateDay("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
            {format(day, "EEEE, MMMM d", { locale: enUS })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => onNavigateDay("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {dayConflicts.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {dayConflicts.length} conflict{dayConflicts.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Time-based Grid */}
      <Card className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-center text-xs font-medium text-muted-foreground w-[70px] sticky left-0 bg-card z-10">
                  <Clock className="h-3.5 w-3.5 mx-auto" />
                </th>
                {coaches.map((coach, idx) => {
                  const color = getCoachColor(coach.id, idx);
                  const timeOff = getCoachTimeOff(coach.id);
                  const isOff = timeOff.some((t) => t.date === dayStr);

                  return (
                    <th key={coach.id} className="p-2 text-center min-w-[130px]">
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className={`${color.bg} text-white text-xs`}>
                            {coach.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{coach.name.split(" ")[0]}</span>
                        {isOff && (
                          <Badge variant="outline" className="text-[10px] text-yellow-500 border-yellow-500/30">
                            <Palmtree className="h-2.5 w-2.5 mr-0.5" />
                            Off
                          </Badge>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => {
                const isCurrentHour = isToday && hour === currentHour;
                return (
                  <tr
                    key={hour}
                    className={`border-b last:border-b-0 ${
                      isCurrentHour ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-2 text-center text-xs text-muted-foreground sticky left-0 bg-card z-10 border-r font-mono">
                      {`${hour.toString().padStart(2, "0")}:00`}
                    </td>
                    {coaches.map((coach, idx) => {
                      const color = getCoachColor(coach.id, idx);
                      const slotSessions = getCoachSessionsForSlot(coach.id, day, hour);
                      const timeOff = getCoachTimeOff(coach.id);
                      const isOff = timeOff.some((t) => t.date === dayStr);
                      const isConflict = slotSessions.length > 1;

                      return (
                        <td
                          key={coach.id}
                          className={`p-1 border-r last:border-r-0 min-h-[48px] ${
                            isOff ? "bg-yellow-500/5" : ""
                          } ${isConflict ? "bg-red-500/5" : ""}`}
                        >
                          {isOff ? (
                            <div className="h-full" />
                          ) : (
                            slotSessions.map((session) => {
                              const typeConfig = SESSION_TYPE_CONFIG[session.session_type];
                              return (
                                <div
                                  key={session.id}
                                  className={`rounded-md p-2 border ${
                                    isConflict
                                      ? "border-red-500/50 bg-red-500/10"
                                      : `${color.border} ${color.light}`
                                  }`}
                                >
                                  <div className="flex items-center gap-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${typeConfig?.color || "bg-gray-500"} shrink-0`} />
                                    <span className="text-xs font-medium truncate">
                                      {session.title}
                                    </span>
                                    {isConflict && (
                                      <AlertTriangle className="h-2.5 w-2.5 text-red-400 shrink-0 ml-auto" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      {session.session_type === "personal" ? (
                                        <User className="h-2.5 w-2.5" />
                                      ) : (
                                        <Users className="h-2.5 w-2.5" />
                                      )}
                                      {session.current_participants}/{session.max_participants}
                                    </span>
                                    <span>CHF {session.price}</span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Birthdays for this day */}
      {coaches.some((c) => getCoachBirthdays(c.id).some((b) => b.date === dayStr)) && (
        <Card className="glass-card border-pink-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Cake className="h-4 w-4 text-pink-400" />
              <span className="text-sm font-medium">Member Birthdays</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {coaches.map((coach) => {
                const birthdays = getCoachBirthdays(coach.id).filter((b) => b.date === dayStr);
                return birthdays.map((b) => (
                  <Badge key={`${coach.id}-${b.memberName}`} variant="outline" className="text-xs border-pink-500/30 text-pink-400">
                    {b.memberName} (Coach: {coach.name.split(" ")[0]})
                  </Badge>
                ));
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
