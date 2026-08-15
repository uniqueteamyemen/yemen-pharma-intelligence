import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Handshake, Check, X, Loader2, AlertCircle, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MatchesPage() {
  const { t, language } = useLanguage();
  const utils = trpc.useUtils();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [tab, setTab] = useState<"offers" | "requests">("offers");

  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ entityId: entity.data?.id, status: "active", limit: 100 }, { enabled: !!entity.data?.id });
  const requests = trpc.requests.list.useQuery({ entityId: entity.data?.id, status: "open", limit: 100 }, { enabled: !!entity.data?.id });

  const offerMatches = trpc.matching.byOffer.useQuery(
    { offerId: selectedOfferId! },
    { enabled: selectedOfferId !== null }
  );

  const requestMatches = trpc.matching.byRequest.useQuery(
    { requestId: selectedRequestId! },
    { enabled: selectedRequestId !== null }
  );

  const runMatchingMutation = trpc.matching.run.useMutation({
    onSuccess: (data) => {
      toast.success(`${t("Found")} ${data.length} ${t(data.length === 1 ? "potential match" : "potential matches")}`);
      if (tab === "offers" && selectedOfferId) {
        utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const acceptMatch = trpc.matching.accept.useMutation({
    onSuccess: () => {
      toast.success(t("Match accepted - conversation started"));
      if (selectedOfferId) utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
      if (selectedRequestId) utils.matching.byRequest.invalidate({ requestId: selectedRequestId });
      utils.notifications.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMatch = trpc.matching.reject.useMutation({
    onSuccess: () => {
      toast.success(t("Match rejected"));
      if (selectedOfferId) utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
      if (selectedRequestId) utils.matching.byRequest.invalidate({ requestId: selectedRequestId });
    },
    onError: (err) => toast.error(err.message),
  });

  const drugNames = trpc.drugs.all.useQuery();

  const getDrugName = (drugId: number | null, isFreeText: boolean, freeTextName?: string | null) => {
    if (isFreeText) return freeTextName || t("Unknown");
    if (drugId && drugNames.data) {
      const drug = drugNames.data.find(d => d.id === drugId);
      return drug ? `${drug.brandName || ""} (${language === "ar" && drug.genericNameAr ? drug.genericNameAr : drug.genericName})` : `${t("Drug")} #${drugId}`;
    }
    return t("Unknown");
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 100) return "bg-green-500";
    if (score >= 80) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 100) return "default";
    if (score >= 80) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Handshake className="h-6 w-6" />
            {t("Matches")}
          </h1>
          <p className="text-muted-foreground">{t("Automatic supply-demand matching by drug name")}</p>
        </div>
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">{t("How Matching Works")}</p>
              <p>{t("Matches are created automatically when a drug name matches between your offers and requests, regardless of quantity. Location and urgency add bonus points to the match score.")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant={tab === "offers" ? "default" : "outline"}
          size="sm"
          onClick={() => { setTab("offers"); setSelectedRequestId(null); }}
        >
          {t("My Offers")}
        </Button>
        <Button
          variant={tab === "requests" ? "default" : "outline"}
          size="sm"
          onClick={() => { setTab("requests"); setSelectedOfferId(null); }}
        >
          {t("My Requests")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "offers" ? t("Select an Offer to View Matches") : t("Select a Request to View Matches")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tab === "offers" ? (
            <>
              {!offers.data || offers.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("No active offers yet. Create one to find matches.")}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {offers.data?.map((offer) => (
                      <button
                        key={offer.id}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          selectedOfferId === offer.id
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border hover:bg-accent hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedOfferId(offer.id)}
                      >
                        <span className="font-medium">{offer.isFreeText ? offer.freeTextName : drugNames.data?.find(d => d.id === offer.drugId)?.brandName || `Drug #${offer.drugId}`}</span>
                        <span className="ms-2 text-xs opacity-75">(<span className="ltr-value">{offer.quantity}</span> {t(offer.unit, offer.unit)})</span>
                      </button>
                    ))}
                  </div>

                  {selectedOfferId && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => runMatchingMutation.mutate({ offerId: selectedOfferId })}
                        disabled={runMatchingMutation.isPending}
                        className="w-full sm:w-auto"
                      >
                        {runMatchingMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Zap className="me-2 h-4 w-4" />}
                        {t("Find Matches")}
                      </Button>

                      {offerMatches.isLoading && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}

                      {offerMatches.data && (
                        <div className="space-y-3">
                          {offerMatches.data.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              {t("No matches found yet. Create more requests to find matches.")}
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-lg">
                                {t("Found")} <span className="ltr-value">{offerMatches.data.length}</span> {t(offerMatches.data.length === 1 ? "match" : "matches")}
                              </h3>
                              {offerMatches.data.map((match) => {
                                const req = requests.data?.find(r => r.id === match.requestId);
                                const score = parseFloat(match.matchScore);
                                return (
                                  <div key={match.id} className="rounded-lg border border-border/50 p-4 space-y-3 hover:border-primary/50 hover:bg-accent/30 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <p className="font-semibold text-base">
                                          {getDrugName(req?.drugId || null, req?.isFreeText || false, req?.freeTextName || null)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {t("Requested")}: <span className="ltr-value">{req?.quantity}</span> {t(req?.unit || "", req?.unit || "")} · {t("Urgency")}: <span className="font-medium capitalize">{t(req?.urgency || "", req?.urgency || "")}</span>
                                        </p>
                                      </div>
                                      <Badge className={getMatchScoreBadge(score)}>
                                        <span className="ltr-value">{score.toFixed(0)}%</span> {t("Match")}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/30 p-3 rounded">
                                      <div>
                                        <p className="text-muted-foreground">{t("Drug Match")}</p>
                                        <p className="font-semibold">{(parseFloat(match.drugMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Location")}</p>
                                        <p className="font-semibold">{(parseFloat(match.locationMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Urgency")}</p>
                                        <p className="font-semibold">{(parseFloat(match.urgencyMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Total")}</p>
                                        <p className="font-semibold">{score.toFixed(0)}%</p>
                                      </div>
                                    </div>

                                    <Progress value={Math.min(score, 100)} className="h-2" />

                                    <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => acceptMatch.mutate({ matchId: match.id })}
                                        disabled={match.status !== "suggested" || acceptMatch.isPending}
                                      >
                                        <Check className="me-1 h-3 w-3" /> {t("Accept")}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => rejectMatch.mutate({ matchId: match.id })}
                                        disabled={match.status !== "suggested" || rejectMatch.isPending}
                                      >
                                        <X className="me-1 h-3 w-3" /> {t("Reject")}
                                      </Button>
                                      {match.status === "accepted" && (
                                        <Badge variant="default" className="ms-auto">✓ {t("Accepted")}</Badge>
                                      )}
                                      {match.status === "rejected" && (
                                        <Badge variant="destructive" className="ms-auto">✗ {t("Rejected")}</Badge>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {!requests.data || requests.data.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("No open requests yet. Create one to find matches.")}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {requests.data?.map((req) => (
                      <button
                        key={req.id}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          selectedRequestId === req.id
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : "border-border hover:bg-accent hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedRequestId(req.id)}
                      >
                        <span className="font-medium">{req.isFreeText ? req.freeTextName : drugNames.data?.find(d => d.id === req.drugId)?.brandName || `Drug #${req.drugId}`}</span>
                        <span className="ms-2 text-xs opacity-75">(<span className="ltr-value">{req.quantity}</span> {t(req.unit, req.unit)})</span>
                      </button>
                    ))}
                  </div>

                  {selectedRequestId && (
                    <>
                      {requestMatches.isLoading && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}

                      {requestMatches.data && (
                        <div className="space-y-3">
                          {requestMatches.data.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              {t("No matches found yet. Other entities need to create offers for this drug.")}
                            </div>
                          ) : (
                            <>
                              <h3 className="font-semibold text-lg">
                                {t("Found")} <span className="ltr-value">{requestMatches.data.length}</span> {t(requestMatches.data.length === 1 ? "match" : "matches")}
                              </h3>
                              {requestMatches.data.map((match) => {
                                const offer = offers.data?.find(o => o.id === match.offerId);
                                const score = parseFloat(match.matchScore);
                                return (
                                  <div key={match.id} className="rounded-lg border border-border/50 p-4 space-y-3 hover:border-primary/50 hover:bg-accent/30 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <p className="font-semibold text-base">
                                          {getDrugName(offer?.drugId || null, offer?.isFreeText || false, offer?.freeTextName || null)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {t("Available")}: <span className="ltr-value">{offer?.quantity}</span> {t(offer?.unit || "", offer?.unit || "")}
                                        </p>
                                      </div>
                                      <Badge className={getMatchScoreBadge(score)}>
                                        <span className="ltr-value">{score.toFixed(0)}%</span> {t("Match")}
                                      </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/30 p-3 rounded">
                                      <div>
                                        <p className="text-muted-foreground">{t("Drug Match")}</p>
                                        <p className="font-semibold">{(parseFloat(match.drugMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Location")}</p>
                                        <p className="font-semibold">{(parseFloat(match.locationMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Urgency")}</p>
                                        <p className="font-semibold">{(parseFloat(match.urgencyMatchScore || '0')).toFixed(0)}%</p>
                                      </div>
                                      <div>
                                        <p className="text-muted-foreground">{t("Total")}</p>
                                        <p className="font-semibold">{score.toFixed(0)}%</p>
                                      </div>
                                    </div>

                                    <Progress value={Math.min(score, 100)} className="h-2" />

                                    <div className="flex items-center gap-2 pt-2">
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => acceptMatch.mutate({ matchId: match.id })}
                                        disabled={match.status !== "suggested" || acceptMatch.isPending}
                                      >
                                        <Check className="me-1 h-3 w-3" /> {t("Accept")}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => rejectMatch.mutate({ matchId: match.id })}
                                        disabled={match.status !== "suggested" || rejectMatch.isPending}
                                      >
                                        <X className="me-1 h-3 w-3" /> {t("Reject")}
                                      </Button>
                                      {match.status === "accepted" && (
                                        <Badge variant="default" className="ms-auto">✓ {t("Accepted")}</Badge>
                                      )}
                                      {match.status === "rejected" && (
                                        <Badge variant="destructive" className="ms-auto">✗ {t("Rejected")}</Badge>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
