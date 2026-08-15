import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";
import OverviewPage from "./dashboard/Overview";
import OffersPage from "./dashboard/Offers";
import RequestsPage from "./dashboard/Requests";
import EntitiesPage from "./dashboard/Entities";
import DrugsPage from "./dashboard/Drugs";
import MessagesPage from "./dashboard/Messages";
import NotificationsPage from "./dashboard/Notifications";
import IntelligencePage from "./dashboard/Intelligence";
import AlternativesPage from "./dashboard/Alternatives";
import ProfilePage from "./dashboard/Profile";
import MatchesPage from "./dashboard/Matches";
import RegisterPage from "./dashboard/Register";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

function DashboardRouter() {
  const { t } = useLanguage();
  const { user, isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();
  const entity = trpc.entity.getByUserId.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isAdmin = user?.role === "admin";
  const isVerified = entity.data?.status === "verified";
  const protectedRoutes = ["/dashboard/offers", "/dashboard/requests", "/dashboard/matches", "/dashboard/overview", "/dashboard"];

  useEffect(() => {
    if (isAuthenticated && !entity.isLoading && !entity.data && location !== "/dashboard/register") {
      toast.info(t("Please register your entity to access all features"));
      setLocation("/dashboard/register");
    }
  }, [isAuthenticated, entity.data, entity.isLoading, location, setLocation, t]);

  // Guard for non-verified users on protected routes
  useEffect(() => {
    if (
      isAuthenticated &&
      !loading &&
      !entity.isLoading &&
      entity.data &&
      !isAdmin &&
      !isVerified &&
      protectedRoutes.includes(location) &&
      location !== "/dashboard/register"
    ) {
      setLocation("/dashboard/register");
    }
  }, [isAuthenticated, loading, entity.data, entity.isLoading, isAdmin, isVerified, location, setLocation]);

  if (loading || (isAuthenticated && entity.isLoading)) {
    return <div className="flex items-center justify-center h-full"><span>{t("Loading...")}</span></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Button onClick={() => startLogin()}>{t("Sign In")}</Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={OverviewPage} />
        <Route path="/dashboard/overview" component={OverviewPage} />
        <Route path="/dashboard/offers" component={OffersPage} />
        <Route path="/dashboard/requests" component={RequestsPage} />
        <Route path="/dashboard/drugs" component={DrugsPage} />
        <Route path="/dashboard/messages" component={MessagesPage} />
        <Route path="/dashboard/notifications" component={NotificationsPage} />
        {isAdmin && <Route path="/dashboard/entities" component={EntitiesPage} />}
        {isAdmin && <Route path="/dashboard/intelligence" component={IntelligencePage} />}
        {isAdmin && <Route path="/dashboard/alternatives" component={AlternativesPage} />}
        <Route path="/dashboard/profile" component={ProfilePage} />
        <Route path="/dashboard/matches" component={MatchesPage} />
        <Route path="/dashboard/register" component={RegisterPage} />
      </Switch>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return <DashboardRouter />;
}
