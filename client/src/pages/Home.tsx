import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { startLogin } from "@/const";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  FileSearch,
  Globe,
  Handshake,
  MapPin,
  MessageSquare,
  Pill,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">PharmaYemen</span>
            <LanguageSwitcher compact />
          </div>
          <div className="flex items-center gap-3">
            {loading ? null : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">{t("Dashboard")}</Button>
              </Link>
            ) : (
              <Button onClick={() => startLogin()} size="sm">
                {t("Sign in")}
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Activity className="h-4 w-4" />
            {t("Market Intelligence Platform")}
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            {t("Connecting Yemen's")}
            <span className="text-primary"> {t("Pharmaceutical")}</span>
            <br />
            {t("Supply & Demand")}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {t("The first intelligent marketplace linking pharmacies, hospitals, distributors, and clinics across Yemen. Match supply with demand, discover alternatives, and access real-time market intelligence.")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                  {t("Go to Dashboard")}
                  <ArrowRight className="ms-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={() => startLogin()} size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                {t("Get Started")}
                <ArrowRight className="ms-2 h-4 w-4" />
              </Button>
            )}
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                {t("Learn More")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-secondary/50 py-12">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: t("Governorates"), value: "22", icon: MapPin },
            { label: t("Drug Categories"), value: "14", icon: Pill },
            { label: t("Active Matches"), value: t("Real-time"), icon: Handshake },
            { label: t("Market Signals"), value: t("Daily"), icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              {t("Intelligent Pharmaceutical Marketplace")}
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              {t("Built specifically for Yemen's pharmaceutical ecosystem with features designed to address real supply chain challenges.")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Building2,
                title: t("Entity Verification"),
                desc: t("Register as a pharmacy, hospital, distributor, or clinic with admin approval and role-based access control."),
              },
              {
                icon: FileSearch,
                title: t("Official Drug Catalog"),
                desc: t("Full-text search by brand name, generic name, and active ingredient. Free-text entries for unlisted drugs."),
              },
              {
                icon: Handshake,
                title: t("Supply & Demand Matching"),
                desc: t("Publish offers or requests and let our intelligent matching engine connect you with the right counterpart."),
              },
              {
                icon: MessageSquare,
                title: t("Secure Messaging"),
                desc: t("Chat with matched entities. Contact details are only revealed after mutual consent from both parties."),
              },
              {
                icon: BarChart3,
                title: t("Market Intelligence"),
                desc: t("Regional shortage and surplus indices, most-demanded drugs, and supply-demand trend analysis."),
              },
              {
                icon: Globe,
                title: t("Geographic Coverage"),
                desc: t("Pre-seeded with Yemen's 22 governorates and regions. Location-based filtering and matching across the country."),
              },
              {
                icon: Bell,
                title: t("Smart Notifications"),
                desc: t("In-app and email alerts for new matches, messages, and market signals affecting your region."),
              },
              {
                icon: Pill,
                title: t("Drug Alternatives"),
                desc: t("Link substitute drugs by active ingredient or therapeutic category for better matching."),
              },
              {
                icon: Shield,
                title: t("Admin Dashboard"),
                desc: t("Entity verification queue, drug catalog management, and platform-wide market signal review."),
              },
            ].map((feature) => (
              <Card key={feature.title} className="group border-border/50 bg-card transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-24">
        <div className="container">
          <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight">{t("How It Works")}</h2>
            <p className="text-muted-foreground">{t("Three simple steps to connect supply with demand")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: t("Register & Verify"),
                desc: t("Create your entity profile as a pharmacy, hospital, distributor, or clinic. Admin verification ensures trust."),
              },
              {
                step: "02",
                title: t("Publish & Match"),
                desc: t("Post your offers or requests. Our matching engine scores pairs by drug, location, urgency, and quantity."),
              },
              {
                step: "03",
                title: t("Connect & Trade"),
                desc: t("Chat with matches, reveal contact info by mutual consent, and complete the transaction outside the platform."),
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 text-5xl font-bold text-primary/15">{item.step}</div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12">
        <div className="container text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Pill className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">PharmaYemen</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("Yemen Pharmaceutical Market Intelligence Platform")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">
            {t("Connecting supply and demand across Yemen's pharmaceutical market")}
          </p>
        </div>
      </footer>
    </div>
  );
}
