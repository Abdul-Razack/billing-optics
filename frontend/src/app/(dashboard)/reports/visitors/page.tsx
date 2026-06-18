"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Loader2,
  Pencil,
  Trash2,
  CalendarDays,
  BarChart3,
  Target,
  Settings2,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VisitorLog {
  id: number;
  logDate: string;
  count: number;
  notes: string | null;
  createdAt: string;
}

// ─── Log type options (what we're counting) ───────────────────────────────────

const LOG_TYPE_OPTIONS = [
  { value: "visitors",      label: "Store Visitors",         unit: "visitors" },
  { value: "walkins",       label: "Walk-ins",               unit: "walk-ins" },
  { value: "enquiries",     label: "Enquiries / Leads",      unit: "enquiries" },
  { value: "consultations", label: "Consultations",          unit: "consultations" },
  { value: "trials",        label: "Frame Trials",           unit: "trials" },
  { value: "custom",        label: "Custom…",                unit: "entries" },
] as const;

type LogTypeValue = typeof LOG_TYPE_OPTIONS[number]["value"];

// ─── Chart Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm">
      <div className="font-medium text-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-3.5 w-3.5 text-primary" />
        <span>
          <strong className="text-foreground">{payload[0].value}</strong> {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Stat Card (muted, not bright) ───────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;       // tailwind text + bg class for the icon chip
  trend?: "up" | "down" | null;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg shrink-0", accent)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{value}</span>
              {trend === "up" && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" /> up
                </span>
              )}
              {trend === "down" && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-rose-500">
                  <TrendingDown className="h-3 w-3" /> down
                </span>
              )}
              {trend === null && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                  <Minus className="h-3 w-3" /> flat
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">{label}</div>
            {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VisitorsLogPage() {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [count, setCount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Log type customisation
  const [logType, setLogType] = useState<LogTypeValue>("visitors");
  const [customLabel, setCustomLabel] = useState("Entries");
  const [showSettings, setShowSettings] = useState(false);

  const activeOption = LOG_TYPE_OPTIONS.find((o) => o.value === logType)!;
  const unitLabel = logType === "custom" ? customLabel.toLowerCase() : activeOption.unit;
  const typeLabel = logType === "custom" ? customLabel : activeOption.label;

  // Edit dialog
  const [editLog, setEditLog] = useState<VisitorLog | null>(null);
  const [editCount, setEditCount] = useState<number | "">("");
  const [editNotes, setEditNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetchClient<{ success: boolean; data: VisitorLog[] }>("/visitor-logs");
      setLogs(res.data || []);
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, [fetchLogs]);

  // ─── Derived stats ──────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLog = logs.find((l) => l.logDate.startsWith(todayStr));

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthLogs = logs.filter((l) => new Date(l.logDate) >= monthStart);
  const monthTotal = monthLogs.reduce((s, l) => s + l.count, 0);
  const monthAvg = monthLogs.length > 0 ? Math.round(monthTotal / monthLogs.length) : 0;

  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  const prevWeekAgo = new Date(now); prevWeekAgo.setDate(prevWeekAgo.getDate() - 14);
  const weekLogs = logs.filter((l) => new Date(l.logDate) >= weekAgo);
  const prevWeekLogs = logs.filter((l) => new Date(l.logDate) >= prevWeekAgo && new Date(l.logDate) < weekAgo);
  const weekTotal = weekLogs.reduce((s, l) => s + l.count, 0);
  const prevWeekTotal = prevWeekLogs.reduce((s, l) => s + l.count, 0);
  const weekTrend: "up" | "down" | null =
    weekTotal > prevWeekTotal ? "up" : weekTotal < prevWeekTotal ? "down" : null;

  const peak = logs.length > 0 ? Math.max(...logs.map((l) => l.count)) : 0;

  // Chart — last 30 days
  const chartData = (() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const log = logs.find((l) => l.logDate.startsWith(ds));
      result.push({
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count: log?.count ?? 0,
        isToday: ds === todayStr,
      });
    }
    return result;
  })();

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count === "") return;
    setIsSaving(true);
    try {
      await fetchClient("/visitor-logs", {
        method: "POST",
        data: { logDate: date, count: Number(count), notes },
      });
      toast.success("Log saved!");
      setCount("");
      setNotes("");
      await fetchLogs();
    } catch {
      toast.error("Failed to save log");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editLog || editCount === "") return;
    setIsEditing(true);
    try {
      await fetchClient(`/visitor-logs/${editLog.id}`, {
        method: "PUT",
        data: { count: Number(editCount), notes: editNotes },
      });
      toast.success("Log updated!");
      setEditLog(null);
      await fetchLogs();
    } catch {
      toast.error("Failed to update log");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await fetchClient(`/visitor-logs/${deleteId}`, { method: "DELETE" });
      toast.success("Log deleted");
      setDeleteId(null);
      await fetchLogs();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily {typeLabel} Log</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track daily {unitLabel} and spot trends over time.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setShowSettings(true)}
        >
          <Settings2 className="h-4 w-4" />
          Customise
        </Button>
      </div>

      {/* Stat Cards — muted, clean */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={`Today's ${unitLabel}`}
          value={todayLog?.count ?? "—"}
          sub={todayLog ? undefined : "Not logged yet"}
          accent="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CalendarDays}
          label="This month"
          value={monthTotal.toLocaleString()}
          sub={`${monthLogs.length} days recorded`}
          accent="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={TrendingUp}
          label="This week"
          value={weekTotal.toLocaleString()}
          sub={`vs ${prevWeekTotal} last week`}
          accent="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          trend={weekTrend}
        />
        <StatCard
          icon={Target}
          label="Daily average"
          value={monthAvg}
          sub={`Peak: ${peak}`}
          accent="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                30-Day Trend
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Daily {unitLabel} for the last 30 days
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-normal">
              Avg {monthAvg} / day
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip unit={unitLabel} />} />
                {monthAvg > 0 && (
                  <ReferenceLine
                    y={monthAvg}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.4}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#grad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log form */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Log {typeLabel}</CardTitle>
            <CardDescription className="text-xs">
              Saves or updates the entry for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{typeLabel} Count</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 42"
                  value={count}
                  onChange={(e) => setCount(e.target.value ? Number(e.target.value) : "")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Notes <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  placeholder="e.g. Weekend rush, new promotion..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <Button type="submit" disabled={isSaving || count === ""} className="w-full" size="sm">
                {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                Save Entry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Entries</CardTitle>
            <CardDescription className="text-xs">Last 30 entries — click the pencil to edit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  <Users className="h-8 w-8 opacity-20 mb-2" />
                  No entries yet. Log your first day above.
                </div>
              ) : (
                logs.slice(0, 30).map((log) => {
                  const isToday = log.logDate.startsWith(todayStr);
                  const aboveAvg = monthAvg > 0 && log.count > monthAvg;
                  const isAuto = log.notes?.startsWith("Auto:");

                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm",
                        isToday
                          ? "border-primary/20 bg-primary/5"
                          : "border-transparent hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-muted-foreground shrink-0 w-28 text-xs">
                          {new Date(log.logDate).toLocaleDateString("en-IN", {
                            weekday: "short", day: "numeric", month: "short",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isToday && (
                            <Badge className="text-xs h-4 px-1.5 py-0 font-medium">Today</Badge>
                          )}
                          {aboveAvg && (
                            <Badge variant="secondary" className="text-xs h-4 px-1.5 py-0 text-emerald-600 dark:text-emerald-400">
                              ↑ Above avg
                            </Badge>
                          )}
                          {isAuto && (
                            <Badge variant="outline" className="text-xs h-4 px-1.5 py-0 text-muted-foreground">
                              Auto
                            </Badge>
                          )}
                          {log.notes && !isAuto && (
                            <span className="text-xs text-muted-foreground truncate max-w-[160px]">
                              {log.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className={cn(
                          "text-lg font-bold tabular-nums w-12 text-right",
                          aboveAvg ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                        )}>
                          {log.count}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => { setEditLog(log); setEditCount(log.count); setEditNotes(log.notes ?? ""); }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteId(log.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customise Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customise Log Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>What are you counting?</Label>
              <Select value={logType} onValueChange={(v) => setLogType(v as LogTypeValue)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOG_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {logType === "custom" && (
              <div className="space-y-2">
                <Label>Custom name</Label>
                <Input
                  placeholder="e.g. Consultations, Leads..."
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              This changes the label on your log. All existing entries are stored the same way.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editLog} onOpenChange={(o) => !o && setEditLog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Date (read-only)</Label>
              <Input value={editLog?.logDate.split("T")[0] ?? ""} disabled className="opacity-60 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Count</Label>
              <Input
                type="number"
                min="0"
                value={editCount}
                onChange={(e) => setEditCount(e.target.value ? Number(e.target.value) : "")}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditLog(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveEdit} disabled={isEditing || editCount === ""}>
              {isEditing && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
