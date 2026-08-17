import { useState, type FormEvent } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Activity, AlertTriangle, ArrowDownUp, Check, Clock3, DatabaseZap, MapPinned, Plus, RadioTower, ShieldCheck, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Platform = "telegram" | "facebook" | "website" | "other";

const platformLabels: Record<Platform, string> = {
  telegram: "Telegram",
  facebook: "Facebook",
  website: "Website",
  other: "Other",
};

export default function IntelligencePage() {
  const { language } = useLanguage();
  const utils = trpc.useUtils();
  const dashboard = trpc.intelligence.dashboard.useQuery();
  const pendingSignals = trpc.intelligence.externalSignals.useQuery({ reviewStatus: "pending", limit: 6 });
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("telegram");
  const [autoApprove, setAutoApprove] = useState(false);

  const refresh = async () => {
    await Promise.all([
      utils.intelligence.dashboard.invalidate(),
      utils.intelligence.externalSources.invalidate(),
      utils.intelligence.externalSignals.invalidate(),
    ]);
  };

  const addSource = trpc.intelligence.addExternalSource.useMutation({
    onSuccess: async () => {
      toast.success(language === "ar" ? "تمت إضافة المصدر إلى حوكمة الإدارة." : "Source added under admin governance.");
      setSourceOpen(false);
      setSourceName("");
      setSourceUrl("");
      setAutoApprove(false);
      await refresh();
    },
    onError: (error) => toast.error(error.message),
  });
  const updateSource = trpc.intelligence.updateExternalSource.useMutation({ onSuccess: refresh, onError: (error) => toast.error(error.message) });
  const reviewSignal = trpc.intelligence.reviewExternalSignal.useMutation({
    onSuccess: async (_, variables) => {
      toast.success(variables.reviewStatus === "approved" ? (language === "ar" ? "تم اعتماد الإشارة." : "Signal approved.") : (language === "ar" ? "تم رفض الإشارة." : "Signal rejected."));
      await refresh();
    },
    onError: (error) => toast.error(error.message),
  });

  const submitSource = (event: FormEvent) => {
    event.preventDefault();
    addSource.mutate({ name: sourceName, platform, sourceUrl, autoApproveSignals: autoApprove });
  };

  if (dashboard.isLoading) return <DashboardSkeleton />;
  const data = dashboard.data;
  if (!data) return <div className="p-6 text-sm text-muted-foreground">{language === "ar" ? "تعذر تحميل مؤشرات السوق." : "Market intelligence could not be loaded."}</div>;

  const maxVolume = Math.max(1, ...data.governorates.map((item) => Math.max(item.demandCount, item.supplyCount)));
  const hasInternalSignals = data.totals.activeOffers > 0 || data.totals.openRequests > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <section className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 p-6 text-white shadow-sm">
        <div className="absolute -end-8 -top-12 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-wide text-teal-100"><RadioTower className="h-4 w-4" />{language === "ar" ? "مرصد السوق الداخلي" : "INTERNAL MARKET OBSERVATORY"}</div>
            <h1 className="text-2xl font-bold sm:text-3xl">{language === "ar" ? "مؤشرات الشح والفائض" : "Shortage & Surplus Intelligence"}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-teal-50/85">{language === "ar" ? "عرض إداري مبني على العروض والطلبات الفعلية، مع فصل إشارات المواقع الخارجية حتى تُعتمد." : "An admin-only view based on actual offers and requests, with external observations isolated until approved."}</p>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur"><p className="text-xs text-teal-100">{language === "ar" ? "آخر توليد" : "Generated"}</p><p className="mt-1 font-medium">{new Date(data.generatedAt).toLocaleString(language === "ar" ? "ar-YE" : "en-US")}</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Activity} label={language === "ar" ? "عروض نشطة" : "Active offers"} value={data.totals.activeOffers} tone="teal" />
        <Metric icon={ArrowDownUp} label={language === "ar" ? "طلبات مفتوحة" : "Open requests"} value={data.totals.openRequests} tone="amber" />
        <Metric icon={MapPinned} label={language === "ar" ? "محافظات بها طلب" : "Governorates with demand"} value={data.totals.governoratesWithDemand} tone="indigo" />
        <Metric icon={Clock3} label={language === "ar" ? "إشارات بانتظار الاعتماد" : "Pending reviews"} value={data.totals.pendingExternalReviews} tone="rose" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0"><div><CardTitle>{language === "ar" ? "ضغط الطلب حسب المحافظة" : "Demand pressure by governorate"}</CardTitle><CardDescription>{language === "ar" ? "عدد السجلات التشغيلية، وليس كمية مخزون أو تقديراً وطنياً." : "Operational record counts, not inventory quantities or a national estimate."}</CardDescription></div><Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">{language === "ar" ? "بيانات داخلية" : "Internal"}</Badge></CardHeader>
          <CardContent>{hasInternalSignals && data.governorates.length ? <div className="space-y-5">{data.governorates.slice(0, 8).map((item) => <GovernorateRow key={item.id} name={language === "ar" && item.nameAr ? item.nameAr : item.name} demand={item.demandCount} supply={item.supplyCount} pressure={item.pressure} max={maxVolume} language={language} />)}</div> : <InternalEmpty language={language} />}</CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader><CardTitle>{language === "ar" ? "أولوية الأدوية" : "Medicine priorities"}</CardTitle><CardDescription>{language === "ar" ? "مرتبة حسب فرق عدد الطلبات عن العروض." : "Ranked by the gap between request and offer records."}</CardDescription></CardHeader>
          <CardContent>{data.topMedicines.length ? <div className="space-y-3">{data.topMedicines.map((item, index) => <div key={item.drugId} className="flex items-center gap-3 rounded-xl border border-border/60 p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{language === "ar" && item.genericNameAr ? item.genericNameAr : item.genericName}</p><p className="truncate text-xs text-muted-foreground">{item.strength || (language === "ar" ? "تركيز غير مسجل" : "Strength not recorded")}</p></div><Badge variant={item.pressure > 0 ? "destructive" : "secondary"}>{language === "ar" ? `فجوة ${item.pressure}` : `Gap ${item.pressure}`}</Badge></div>)}</div> : <InternalEmpty language={language} compact />}</CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><CardTitle>{language === "ar" ? "إشارات السوق الخارجية" : "External market signals"}</CardTitle><Badge variant="outline">{language === "ar" ? "مراجعة إدارية" : "Admin governed"}</Badge></div><CardDescription>{language === "ar" ? "لا تدخل الإشارات الخارجية في المؤشرات الداخلية قبل الاعتماد." : "External signals never affect internal metrics until approved."}</CardDescription></div><SourceDialog language={language} open={sourceOpen} onOpenChange={setSourceOpen} sourceName={sourceName} sourceUrl={sourceUrl} platform={platform} autoApprove={autoApprove} onSourceNameChange={setSourceName} onSourceUrlChange={setSourceUrl} onPlatformChange={setPlatform} onAutoApproveChange={setAutoApprove} onSubmit={submitSource} saving={addSource.isPending} /></CardHeader>
          <CardContent><div className="mb-4 grid grid-cols-4 gap-2"><ReviewStat label={language === "ar" ? "بانتظار" : "Pending"} value={data.external.reviewCounts.pending} /><ReviewStat label={language === "ar" ? "معتمد" : "Approved"} value={data.external.reviewCounts.approved} /><ReviewStat label={language === "ar" ? "آلي" : "Auto"} value={data.external.reviewCounts.autoApproved} /><ReviewStat label={language === "ar" ? "مرفوض" : "Rejected"} value={data.external.reviewCounts.rejected} /></div>{data.external.sources.length ? <div className="space-y-3">{data.external.sources.map((source) => <div key={source.id} className="rounded-xl border border-border/60 p-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{source.name}</p><p dir="ltr" className="truncate text-xs text-muted-foreground">{source.sourceUrl}</p></div><Badge variant={source.isActive ? "secondary" : "outline"}>{source.isActive ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "موقوف" : "Paused")}</Badge></div><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => updateSource.mutate({ id: source.id, isActive: !source.isActive })}>{source.isActive ? (language === "ar" ? "إيقاف" : "Pause") : (language === "ar" ? "تفعيل" : "Enable")}</Button><Button variant={source.autoApproveSignals ? "default" : "outline"} size="sm" onClick={() => updateSource.mutate({ id: source.id, autoApproveSignals: !source.autoApproveSignals })}><ShieldCheck className="me-1 h-3.5 w-3.5" />{source.autoApproveSignals ? (language === "ar" ? "القبول الآلي مفعل" : "Auto-approval on") : (language === "ar" ? "قبول يدوي" : "Manual review")}</Button></div></div>)}</div> : <ExternalEmpty language={language} />}</CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader><CardTitle>{language === "ar" ? "طابور اعتماد الإدارة" : "Admin review queue"}</CardTitle><CardDescription>{language === "ar" ? "كل إشارة جديدة تحتاج قراراً، إلا إذا فُعل القبول الآلي القابل للإلغاء للمصدر." : "Every new signal needs a decision unless reversible auto-approval is enabled for its source."}</CardDescription></CardHeader>
          <CardContent>{pendingSignals.isLoading ? <Skeleton className="h-32 w-full" /> : pendingSignals.data?.length ? <div className="space-y-3">{pendingSignals.data.map(({ signal, source, drug, governorate }) => <div key={signal.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold">{language === "ar" && drug?.genericNameAr ? drug.genericNameAr : drug?.genericName || signal.freeTextName || (language === "ar" ? "دواء غير محدد" : "Unspecified medicine")}</p><p className="mt-1 text-xs text-muted-foreground">{source.name} · {language === "ar" && governorate?.nameAr ? governorate.nameAr : governorate?.name || (language === "ar" ? "المحافظة غير محددة" : "Governorate not specified")}</p></div><Badge variant="outline" className="border-amber-300 bg-white text-amber-800">{signal.signalType}</Badge></div><p className="mt-2 text-xs leading-5 text-slate-700">{signal.summary}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => reviewSignal.mutate({ id: signal.id, reviewStatus: "approved" })} disabled={reviewSignal.isPending}><Check className="me-1 h-3.5 w-3.5" />{language === "ar" ? "اعتماد" : "Approve"}</Button><Button size="sm" variant="outline" onClick={() => reviewSignal.mutate({ id: signal.id, reviewStatus: "rejected" })} disabled={reviewSignal.isPending}><X className="me-1 h-3.5 w-3.5" />{language === "ar" ? "رفض" : "Reject"}</Button></div></div>)}</div> : <ReviewEmpty language={language} />}</CardContent>
        </Card>
      </section>
    </div>
  );
}

function SourceDialog({ language, open, onOpenChange, sourceName, sourceUrl, platform, autoApprove, onSourceNameChange, onSourceUrlChange, onPlatformChange, onAutoApproveChange, onSubmit, saving }: { language: string; open: boolean; onOpenChange: (value: boolean) => void; sourceName: string; sourceUrl: string; platform: Platform; autoApprove: boolean; onSourceNameChange: (value: string) => void; onSourceUrlChange: (value: string) => void; onPlatformChange: (value: Platform) => void; onAutoApproveChange: (value: boolean) => void; onSubmit: (event: FormEvent) => void; saving: boolean }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogTrigger asChild><Button size="sm"><Plus className="me-1.5 h-4 w-4" />{language === "ar" ? "إضافة مصدر" : "Add source"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{language === "ar" ? "إضافة مصدر خارجي" : "Add external source"}</DialogTitle></DialogHeader><form onSubmit={onSubmit} className="space-y-4"><div className="space-y-2"><Label>{language === "ar" ? "اسم المصدر" : "Source name"}</Label><Input required value={sourceName} onChange={(event) => onSourceNameChange(event.target.value)} /></div><div className="space-y-2"><Label>{language === "ar" ? "المنصة" : "Platform"}</Label><Select value={platform} onValueChange={(value) => onPlatformChange(value as Platform)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(platformLabels) as Platform[]).map((value) => <SelectItem key={value} value={value}>{platformLabels[value]}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>{language === "ar" ? "الرابط" : "Source URL"}</Label><Input required type="url" dir="ltr" value={sourceUrl} onChange={(event) => onSourceUrlChange(event.target.value)} placeholder="https://…" /></div><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><input className="mt-1" type="checkbox" checked={autoApprove} onChange={(event) => onAutoApproveChange(event.target.checked)} /><span><strong>{language === "ar" ? "قبول آلي قابل للإلغاء" : "Reversible auto-approval"}</strong><br /><span className="text-xs">{language === "ar" ? "هذا إعداد تشغيلي قابل للتعطيل، وليس ثقة دائمة بالمصدر." : "This is a reversible operational setting, not permanent source trust."}</span></span></label><Button className="w-full" type="submit" disabled={saving}>{saving ? (language === "ar" ? "جارٍ الحفظ…" : "Saving…") : (language === "ar" ? "حفظ المصدر" : "Save source")}</Button></form></DialogContent></Dialog>;
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: number; tone: "teal" | "amber" | "indigo" | "rose" }) {
  const style = { teal: "bg-teal-50 text-teal-700", amber: "bg-amber-50 text-amber-700", indigo: "bg-indigo-50 text-indigo-700", rose: "bg-rose-50 text-rose-700" }[tone];
  return <Card className="border-border/70 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><div className={`rounded-xl p-3 ${style}`}><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold tabular-nums">{value}</p><p className="mt-0.5 text-xs text-muted-foreground">{label}</p></div></CardContent></Card>;
}

function GovernorateRow({ name, demand, supply, pressure, max, language }: { name: string; demand: number; supply: number; pressure: number; max: number; language: string }) {
  return <div><div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">{name}</span><span className="text-xs text-muted-foreground">{language === "ar" ? `ضغط ${pressure}` : `Pressure ${pressure}`}</span></div><MiniBar label={language === "ar" ? "الطلب" : "Demand"} value={demand} max={max} color="bg-amber-500" /><MiniBar label={language === "ar" ? "العرض" : "Supply"} value={supply} max={max} color="bg-teal-600" /></div>;
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) { return <div className="mb-1.5 grid grid-cols-[3.5rem_1fr_2rem] items-center gap-2"><span className="text-[11px] text-muted-foreground">{label}</span><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div><span className="text-end text-[11px] font-medium tabular-nums">{value}</span></div>; }
function ReviewStat({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center"><p className="text-base font-bold tabular-nums">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>; }
function InternalEmpty({ language, compact = false }: { language: string; compact?: boolean }) { return <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-8" : "py-12"}`}><DatabaseZap className="mb-3 h-9 w-9 text-teal-600/50" /><p className="text-sm font-medium">{language === "ar" ? "لا توجد إشارات تشغيلية كافية بعد" : "No operational signals yet"}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{language === "ar" ? "ستظهر المؤشرات تلقائياً عند وجود عروض وطلبات موثقة مرتبطة بجهات ومواقع." : "Metrics appear automatically once verified offers and requests include entity locations."}</p></div>; }
function ExternalEmpty({ language }: { language: string }) { return <div className="flex flex-col items-center justify-center py-10 text-center"><RadioTower className="mb-3 h-9 w-9 text-slate-400" /><p className="text-sm font-medium">{language === "ar" ? "لم يُضف مصدر خارجي بعد" : "No external source added"}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{language === "ar" ? "أضف قناة أو صفحة مصرحاً بها؛ ستبقى إشاراتها بانتظار الاعتماد ما لم يُفعّل القبول الآلي القابل للإلغاء." : "Add an approved channel or page. Observations remain pending unless reversible auto-approval is enabled."}</p></div>; }
function ReviewEmpty({ language }: { language: string }) { return <div className="flex flex-col items-center justify-center py-12 text-center"><AlertTriangle className="mb-3 h-9 w-9 text-amber-500/60" /><p className="text-sm font-medium">{language === "ar" ? "لا توجد إشارات معلّقة" : "No pending signals"}</p><p className="mt-1 text-xs text-muted-foreground">{language === "ar" ? "لا يوجد حالياً شيء يحتاج قراراً من الإدارة." : "There is currently nothing awaiting an administrative decision."}</p></div>; }
function DashboardSkeleton() { return <div className="space-y-6 p-6"><Skeleton className="h-44 w-full rounded-2xl" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>; }
