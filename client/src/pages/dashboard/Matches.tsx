import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Handshake, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MatchesPage() {
  const utils = trpc.useUtils();
  const [selectedOfferId, setSelectedOfferId] = useState<number | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [tab, setTab] = useState<"offers" | "requests">("offers");

  const entity = trpc.entity.getByUserId.useQuery();
  const offers = trpc.offers.list.useQuery({ status: "active", limit: 100 });
  const requests = trpc.requests.list.useQuery({ status: "open", limit: 100 });

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
      toast.success(`${data.length} matches found`);
      if (tab === "offers" && selectedOfferId) {
        utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const acceptMatch = trpc.matching.accept.useMutation({
    onSuccess: () => {
      toast.success("Match accepted - conversation started");
      if (selectedOfferId) utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
      utils.notifications.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMatch = trpc.matching.reject.useMutation({
    onSuccess: () => {
      toast.success("Match rejected");
      if (selectedOfferId) utils.matching.byOffer.invalidate({ offerId: selectedOfferId });
    },
    onError: (err) => toast.error(err.message),
  });

  const drugNames = trpc.drugs.all.useQuery();

  const getDrugName = (drugId: number | null, isFreeText: boolean, freeTextName?: string | null) => {
    if (isFreeText) return freeTextName || "Unknown";
    if (drugId && drugNames.data) {
      const drug = drugNames.data.find(d => d.id === drugId);
      return drug ? `${drug.brandName} (${drug.genericName})` : `Drug #${drugId}`;
    }
    return "Unknown";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matches</h1>
          <p className="text-muted-foreground">Detected supply-demand matches</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "offers" ? "default" : "outline"}
          size="sm"
          onClick={() => { setTab("offers"); setSelectedRequestId(null); }}
        >
          By Offer
        </Button>
        <Button
          variant={tab === "requests" ? "default" : "outline"}
          size="sm"
          onClick={() => { setTab("requests"); setSelectedOfferId(null); }}
        >
          By Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "offers" ? "Select an Offer" : "Select a Request"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tab === "offers" ? (
            <>
              <div className="flex gap-2 mb-4">
                {offers.data?.map((offer) => (
                  <button
                    key={offer.id}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selectedOfferId === offer.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedOfferId(offer.id)}
                  >
                    {offer.isFreeText ? offer.freeTextName : drugNames.data?.find(d => d.id === offer.drugId)?.brandName || `Drug #${offer.drugId}`}
                    <span className="ml-2 text-xs text-muted-foreground">({offer.quantity} {offer.unit})</span>
                  </button>
                ))}
              </div>
              {selectedOfferId && (
                <Button
                  size="sm"
                  onClick={() => runMatchingMutation.mutate({ offerId: selectedOfferId })}
                  disabled={runMatchingMutation.isPending}
                >
                  {runMatchingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Run Matching
                </Button>
              )}
              {selectedOfferId && offerMatches.data && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">
                    {offerMatches.data.length} match(es) found
                  </h3>
                  {offerMatches.data.map((match) => {
                    const req = requests.data?.find(r => r.id === match.requestId);
                    const score = parseFloat(match.matchScore);
                    return (
                      <div key={match.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Request: {getDrugName(req?.drugId || null, req?.isFreeText || false, req?.freeTextName || null)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {req?.quantity} {req?.unit} · Urgency: {req?.urgency}
                            </p>
                          </div>
                          <Badge variant={score >= 70 ? "default" : "secondary"}>
                            Score: {score.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Drug: {(parseFloat(match.drugMatchScore || '0')).toFixed(0)}%</div>
                          <div>Location: {(parseFloat(match.locationMatchScore || '0')).toFixed(0)}%</div>
                          <div>Urgency: {(parseFloat(match.urgencyMatchScore || '0')).toFixed(0)}%</div>
                          <div>Quantity: {(parseFloat(match.quantityMatchScore || '0')).toFixed(0)}%</div>
                        </div>
                        <Progress value={score} className="h-2" />
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => acceptMatch.mutate({ matchId: match.id })}
                            disabled={match.status !== "suggested"}
                          >
                            <Check className="mr-1 h-3 w-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMatch.mutate({ matchId: match.id })}
                            disabled={match.status !== "suggested"}
                          >
                            <X className="mr-1 h-3 w-3" /> Reject
                          </Button>
                          {match.status === "accepted" && (
                            <Badge variant="default">Accepted</Badge>
                          )}
                          {match.status === "rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                {requests.data?.map((req) => (
                  <button
                    key={req.id}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      selectedRequestId === req.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => setSelectedRequestId(req.id)}
                  >
                    {req.isFreeText ? req.freeTextName : drugNames.data?.find(d => d.id === req.drugId)?.brandName || `Drug #${req.drugId}`}
                    <span className="ml-2 text-xs text-muted-foreground">({req.quantity} {req.unit})</span>
                  </button>
                ))}
              </div>
              {selectedRequestId && requestMatches.data && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">
                    {requestMatches.data.length} match(es) found
                  </h3>
                  {requestMatches.data.map((match) => {
                    const offer = offers.data?.find(o => o.id === match.offerId);
                    const score = parseFloat(match.matchScore);
                    return (
                      <div key={match.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Offer: {getDrugName(offer?.drugId || null, offer?.isFreeText || false, offer?.freeTextName || null)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {offer?.quantity} {offer?.unit}
                            </p>
                          </div>
                          <Badge variant={score >= 70 ? "default" : "secondary"}>
                            Score: {score.toFixed(0)}%
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Drug: {(parseFloat(match.drugMatchScore || '0')).toFixed(0)}%</div>
                          <div>Location: {(parseFloat(match.locationMatchScore || '0')).toFixed(0)}%</div>
                          <div>Urgency: {(parseFloat(match.urgencyMatchScore || '0')).toFixed(0)}%</div>
                          <div>Quantity: {(parseFloat(match.quantityMatchScore || '0')).toFixed(0)}%</div>
                        </div>
                        <Progress value={score} className="h-2" />
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => acceptMatch.mutate({ matchId: match.id })}
                            disabled={match.status !== "suggested"}
                          >
                            <Check className="mr-1 h-3 w-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectMatch.mutate({ matchId: match.id })}
                            disabled={match.status !== "suggested"}
                          >
                            <X className="mr-1 h-3 w-3" /> Reject
                          </Button>
                          {match.status === "accepted" && (
                            <Badge variant="default">Accepted</Badge>
                          )}
                          {match.status === "rejected" && (
                            <Badge variant="destructive">Rejected</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {!selectedOfferId && !selectedRequestId && (
            <div className="text-center py-8">
              <Handshake className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {tab === "offers" ? "Select an offer to find matching requests" : "Select a request to find matching offers"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
