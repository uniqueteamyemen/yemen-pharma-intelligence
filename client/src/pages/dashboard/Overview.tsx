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
  const { t } = useLanguage();
  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ limit: 5 });
  const requests = trpc.requests.list.useQuery({ limit: 5 });
  const unreadCount = trpc.notifications.unreadCount.useQuery();

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("Dashboard")}</h1>
          <p className="text-muted-foreground">{t("Welcome back")}, {user?.name || "User"}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{offers.data?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">{t("Active Offers")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.data?.length ?? 0}</p>
                <p className="text-sm text-muted-foreground">{t("Open Requests")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Handshake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount.data ?? 0}</p>
                <p className="text-sm text-muted-foreground">Unread Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Offers</CardTitle>
            <Link href="/dashboard/offers">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {offers.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offers yet</p>
            ) : (
              <div className="space-y-3">
                {offers.data?.map((offer) => (
                  <div key={offer.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div>
                      <p className="font-medium text-sm">
                        {offer.isFreeText ? offer.freeTextName : `Drug #${offer.drugId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {offer.quantity} {offer.unit}
                      </p>
                    </div>
                    <Badge variant={offer.status === "active" ? "default" : "secondary"}>
                      {offer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Requests</CardTitle>
            <Link href="/dashboard/requests">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requests.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet</p>
            ) : (
              <div className="space-y-3">
                {requests.data?.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                    <div>
                      <p className="font-medium text-sm">
                        {req.isFreeText ? req.freeTextName : `Drug #${req.drugId}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {req.quantity} {req.unit} · {req.urgency}
                      </p>
                    </div>
                    <Badge variant={req.status === "open" ? "default" : "secondary"}>
                      {req.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Entity Status */}
      {!entity.data && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 text-center">
            <Pill className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-semibold">Register Your Entity</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You need to register as a pharmacy, hospital, distributor, or clinic to use the platform.
            </p>
            <Link href="/dashboard/register">
              <Button>Register Now</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
