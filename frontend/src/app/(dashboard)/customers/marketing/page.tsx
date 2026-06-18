"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchClient } from "@/lib/api-client";
import { ApiCustomer } from "@/types/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Gift,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Search,
  VolumeX,
  Users,
  Copy,
  Check,
  Cake,
  Heart,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500",
    "bg-rose-500","bg-indigo-500","bg-teal-500","bg-orange-500",
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

function daysUntil(dateStr: string, month: number, year: number): number {
  const d = new Date(dateStr);
  const target = new Date(year, month - 1, d.getDate());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  let diff = Math.ceil((target.getTime() - today.getTime()) / 86400000);
  if (diff < 0) diff += 365; // next year
  return diff;
}

// ─── Customer Card ────────────────────────────────────────────────────────────

function CustomerCard({
  customer,
  dateField,
  label,
  month,
  year,
}: {
  customer: ApiCustomer;
  dateField: "dateOfBirth" | "anniversaryDate";
  label: string;
  month: number;
  year: number;
}) {
  const [copied, setCopied] = useState(false);
  const dateValue = customer[dateField] as string | null;
  const days = dateValue ? daysUntil(dateValue, month, year) : null;
  const isToday = days === 0;
  const isSoon = days !== null && days <= 7 && days > 0;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(customer.phone);
    setCopied(true);
    toast.success("Phone number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const phone = customer.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      dateField === "dateOfBirth"
        ? `Happy Birthday ${customer.fullName}! 🎂 Wishing you a wonderful day!`
        : `Happy Anniversary ${customer.fullName}! 🎉 Wishing you many more wonderful years!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
        isToday
          ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700"
          : isSoon
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
            getAvatarColor(customer.fullName)
          )}
        >
          {getInitials(customer.fullName)}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{customer.fullName}</span>
            {isToday && (
              <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0">
                🎉 Today!
              </Badge>
            )}
            {isSoon && !isToday && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                In {days}d
              </Badge>
            )}
            {customer.isDnd && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0 flex items-center gap-1">
                <VolumeX className="h-2.5 w-2.5" /> DND
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" /> {customer.phone}
            </span>
            {customer.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" /> {customer.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right hidden sm:block mr-2">
          <div className="text-sm font-semibold text-foreground">
            {dateValue ? new Date(dateValue).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
          </div>
          <div className="text-xs text-muted-foreground">
            {days === 0 ? "Today" : days === 1 ? "Tomorrow" : days !== null ? `In ${days} days` : ""}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={handleCopy}
          title="Copy phone"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>

        {!customer.isDnd && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-3"
            onClick={handleWhatsApp}
            title="Send WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketingDashboard() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [birthdays, setBirthdays] = useState<ApiCustomer[]>([]);
  const [anniversaries, setAnniversaries] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hideDnd, setHideDnd] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bdayRes, annivRes] = await Promise.all([
        fetchClient<{ success: boolean; data: ApiCustomer[] }>(`/customers/birthdays?month=${month}`),
        fetchClient<{ success: boolean; data: ApiCustomer[] }>(`/customers/anniversaries?month=${month}`),
      ]);
      setBirthdays(bdayRes.data || []);
      setAnniversaries(annivRes.data || []);
    } catch {
      toast.error("Failed to load marketing data");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const filter = (list: ApiCustomer[]) =>
    list
      .filter((c) => !hideDnd || !c.isDnd)
      .filter((c) =>
        search === "" ||
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      );

  const filteredBdays  = filter(birthdays);
  const filteredAnnivs = filter(anniversaries);

  // Stats
  const todayBdays  = birthdays.filter((c) => c.dateOfBirth  && daysUntil(c.dateOfBirth,  month, year) === 0);
  const todayAnnivs = anniversaries.filter((c) => c.anniversaryDate && daysUntil(c.anniversaryDate, month, year) === 0);
  const dndCount    = [...birthdays, ...anniversaries].filter((c) => c.isDnd).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing Hub</h1>
          <p className="text-muted-foreground mt-1">
            Reach out to customers on their special days and boost retention.
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold w-28 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => changeMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          {(month !== today.getMonth() + 1 || year !== today.getFullYear()) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 ml-1"
              onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }}
            >
              Today
            </Button>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none bg-gradient-to-br from-violet-500/10 to-violet-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Cake className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{birthdays.length}</div>
                <div className="text-xs text-muted-foreground">Birthdays this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-rose-500/10 to-rose-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 rounded-lg">
                <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{anniversaries.length}</div>
                <div className="text-xs text-muted-foreground">Anniversaries this month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{todayBdays.length + todayAnnivs.length}</div>
                <div className="text-xs text-muted-foreground">Celebrating today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-slate-500/10 to-slate-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500/20 rounded-lg">
                <VolumeX className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{dndCount}</div>
                <div className="text-xs text-muted-foreground">Do-not-disturb</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={hideDnd ? "default" : "outline"}
          onClick={() => setHideDnd((v) => !v)}
          className="gap-2"
        >
          <VolumeX className="h-4 w-4" />
          {hideDnd ? "Showing non-DND only" : "Include DND"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="birthdays">
        <TabsList className="mb-4 bg-muted/50">
          <TabsTrigger value="birthdays" className="gap-2 data-[state=active]:bg-background">
            <Cake className="w-4 h-4" />
            Birthdays
            {birthdays.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                {filteredBdays.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="anniversaries" className="gap-2 data-[state=active]:bg-background">
            <Heart className="w-4 h-4" />
            Anniversaries
            {anniversaries.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                {filteredAnnivs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="birthdays" className="space-y-3 mt-0">
              {filteredBdays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Cake className="h-12 w-12 mb-3 opacity-20" />
                  <p className="font-medium">No birthdays in {MONTH_NAMES[month - 1]}</p>
                  <p className="text-sm mt-1">Make sure customers have their date of birth recorded.</p>
                </div>
              ) : (
                filteredBdays
                  .sort((a, b) => {
                    const da = a.dateOfBirth ? daysUntil(a.dateOfBirth, month, year) : 999;
                    const db = b.dateOfBirth ? daysUntil(b.dateOfBirth, month, year) : 999;
                    return da - db;
                  })
                  .map((c) => (
                    <CustomerCard
                      key={c.id}
                      customer={c}
                      dateField="dateOfBirth"
                      label="Birthday"
                      month={month}
                      year={year}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="anniversaries" className="space-y-3 mt-0">
              {filteredAnnivs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Heart className="h-12 w-12 mb-3 opacity-20" />
                  <p className="font-medium">No anniversaries in {MONTH_NAMES[month - 1]}</p>
                  <p className="text-sm mt-1">Make sure customers have their anniversary date recorded.</p>
                </div>
              ) : (
                filteredAnnivs
                  .sort((a, b) => {
                    const da = a.anniversaryDate ? daysUntil(a.anniversaryDate, month, year) : 999;
                    const db = b.anniversaryDate ? daysUntil(b.anniversaryDate, month, year) : 999;
                    return da - db;
                  })
                  .map((c) => (
                    <CustomerCard
                      key={c.id}
                      customer={c}
                      dateField="anniversaryDate"
                      label="Anniversary"
                      month={month}
                      year={year}
                    />
                  ))
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
