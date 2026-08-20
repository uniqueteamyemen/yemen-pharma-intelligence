import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Activity, FileText, Handshake, Pill, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function OverviewPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAr = language === "ar";
  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ limit: 5 });
  const requests = trpc.requests.list.useQuery({ limit: 5 });
  const unreadCount = trpc.notifications.unreadCount.useQuery();

  return (
    <div className="space-y-6 p-4 sm:p-6" dir={isAr ? "rtl" : "ltr"}>
      <header className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight">{t("Dashboard")}</h1>
        <p className="mt-1 truncate text-muted-foreground">{t("Welcome back")}, {user?.name || (isAr ? "المستخدم" : "User")}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric icon={FileText} value={offers.data?.length ?? 0} label={t("Active Offers")} />
        <DashboardMetric icon={Activity} value={requests.data?.length ?? 0} label={t("Open Requests")} />
        <DashboardMetric icon={Handshake} value={0} label={isAr ? "مطابقات" : "Matches"} />
        <DashboardMetric icon={TrendingUp} value={unreadCount.data ?? 0} label={isAr ? "تنبيهات غير مقروءة" : "Unread alerts"} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ActivityList
          title={isAr ? "أحدث العروض" : "Recent offers"}
          viewAll={isAr ? "عرض الكل" : "View all"}
          empty={isAr ? "لا توجد عروض بعد" : "No offers yet"}
          href="/dashboard/offers"
          items={offers.data || []}
          renderMeta={(item) => `${item.quantity} ${item.unit}`}
          renderName={(item) => item.isFreeText ? item.freeTextName : (isAr ? `دواء #${item.drugId}` : `Drug #${item.drugId}`)}
          renderStatus={(item) => item.status === "active" ? (isAr ? "نشط" : "Active") : item.status}
        />
        <ActivityList
          title={isAr ? "أحدث الطلبات" : "Recent requests"}
          viewAll={isAr ? "عرض الكل" : "View all"}
          empty={isAr ? "لا توجد طلبات بعد" : "No requests yet"}
          href="/dashboard/requests"
          items={requests.data || []}
          renderMeta={(item) => `${item.quantity} ${item.unit} · ${item.urgency === "medium" && isAr ? "متوسط" : item.urgency}`}
          renderName={(item) => item.isFreeText ? item.freeTextName : (isAr ? `دواء #${item.drugId}` : `Drug #${item.drugId}`)}
          renderStatus={(item) => item.status === "open" ? (isAr ? "مفتوح" : "Open") : item.status}
        />
      </section>

      {!entity.data && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Pill className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h2 className="mb-2 font-semibold">{isAr ? "سجّل جهتك" : "Register your entity"}</h2>
            <p className="mx-auto mb-4 max-w-xl text-sm leading-6 text-muted-foreground">{isAr ? "سجّل كصيدلية أو مستشفى أو موزع أو عيادة لبدء استخدام خدمات المنصة." : "Register as a pharmacy, hospital, distributor, or clinic to use the platform."}</p>
            <Link href="/dashboard/register"><Button>{isAr ? "سجّل الآن" : "Register now"}</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DashboardMetric({ icon: Icon, value, label }: { icon: typeof FileText; value: number; label: string }) {
  return <Card className="min-w-0 border-border/70 shadow-sm"><CardContent className="flex items-center gap-3 p-4 sm:p-6"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div><div className="min-w-0"><p className="text-2xl font-bold tabular-nums">{value}</p><p className="truncate text-sm text-muted-foreground">{label}</p></div></CardContent></Card>;
}

type ActivityItem = { id: number; isFreeText: boolean; freeTextName?: string | null; drugId?: number | null; quantity: number; unit: string; status: string; urgency?: string };

function ActivityList({ title, viewAll, empty, href, items, renderName, renderMeta, renderStatus }: { title: string; viewAll: string; empty: string; href: string; items: ActivityItem[]; renderName: (item: ActivityItem) => string | null | undefined; renderMeta: (item: ActivityItem) => string; renderStatus: (item: ActivityItem) => string }) {
  return <Card className="min-w-0 border-border/70 shadow-sm"><CardHeader className="flex flex-row items-center justify-between gap-3"><CardTitle className="truncate text-lg">{title}</CardTitle><Link href={href}><Button variant="ghost" size="sm">{viewAll}</Button></Link></CardHeader><CardContent>{items.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : <div className="space-y-3">{items.map((item) => <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-border/50 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{renderName(item)}</p><p className="truncate text-xs text-muted-foreground">{renderMeta(item)}</p></div><Badge variant={item.status === "active" || item.status === "open" ? "default" : "secondary"} className="shrink-0">{renderStatus(item)}</Badge></div>)}</div>}</CardContent></Card>;
}
