import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function RequestsPage() {
  const entity = trpc.entity.getByUserId.useQuery();
  const requests = trpc.requests.list.useQuery({ status: "open", limit: 50 });
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string>("");
  const [isFreeText, setIsFreeText] = useState(false);
  const [freeTextName, setFreeTextName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("boxes");
  const [urgency, setUrgency] = useState<string>("medium");
  const [createOpen, setCreateOpen] = useState(false);

  const createRequest = trpc.requests.create.useMutation({
    onSuccess: () => {
      toast.success("Request created successfully");
      setCreateOpen(false);
      utils.requests.list.invalidate();
      setSelectedDrugId("");
      setFreeTextName("");
      setQuantity("");
    },
    onError: (err) => toast.error(err.message),
  });

  const closeRequest = trpc.requests.close.useMutation({
    onSuccess: () => {
      toast.success("Request closed");
      utils.requests.list.invalidate();
    },
  });

  const handleSubmit = () => {
    if (!entity.data) return;
    const drugId = isFreeText ? undefined : (selectedDrugId ? parseInt(selectedDrugId) : undefined);
    createRequest.mutate({
      entityId: entity.data.id,
      drugId,
      isFreeText,
      freeTextName: isFreeText ? freeTextName : undefined,
      quantity: parseInt(quantity) || 1,
      unit,
      urgency: urgency as any,
    });
  };

  const drugSearchResults = trpc.drugs.search.useQuery(
    { query: searchQuery },
    { enabled: !isFreeText && searchQuery.length >= 1 }
  );

  const urgencyColors: Record<string, string> = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
          <p className="text-muted-foreground">Demand requests in the marketplace</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={isFreeText ? "outline" : "default"}
                  size="sm"
                  onClick={() => setIsFreeText(false)}
                >
                  Official Catalog
                </Button>
                <Button
                  variant={isFreeText ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsFreeText(true)}
                >
                  Free Text
                </Button>
              </div>

              {!isFreeText ? (
                <div className="space-y-2">
                  <Label>Select Drug</Label>
                  <Input
                    placeholder="Search drugs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {drugSearchResults.data && drugSearchResults.data.length > 0 && (
                    <div className="max-h-32 overflow-y-auto rounded border border-border p-2 space-y-1">
                      {drugSearchResults.data.map((drug) => (
                        <button
                          key={drug.id}
                          className={`w-full text-left rounded px-2 py-1.5 text-sm hover:bg-accent ${
                            selectedDrugId === String(drug.id) ? "bg-accent" : ""
                          }`}
                          onClick={() => {
                            setSelectedDrugId(String(drug.id));
                            setSearchQuery("");
                          }}
                        >
                          {drug.brandName} ({drug.genericName}) - {drug.strength}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedDrugId && (
                    <p className="text-xs text-muted-foreground">
                      Selected: Drug #{selectedDrugId}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Drug Name</Label>
                  <Input
                    placeholder="Enter drug name (will not be added to official catalog)"
                    value={freeTextName}
                    onChange={(e) => setFreeTextName(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="strips">Strips</SelectItem>
                      <SelectItem value="vials">Vials</SelectItem>
                      <SelectItem value="bottles">Bottles</SelectItem>
                      <SelectItem value="ampoules">Ampoules</SelectItem>
                      <SelectItem value="packs">Packs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!entity.data || (isFreeText ? !freeTextName : !selectedDrugId) || !quantity}
              >
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !requests.data?.length ? (
            <p className="text-muted-foreground">No open requests found</p>
          ) : (
            <div className="space-y-3">
              {requests.data.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {req.isFreeText ? req.freeTextName : `Drug #${req.drugId}`}
                      </p>
                      {req.isFreeText && (
                        <Badge variant="outline" className="text-xs">Unlisted</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {req.quantity} {req.unit} · {req.urgency}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(req.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={urgencyColors[req.urgency] as any || "default"}>
                      {req.urgency}
                    </Badge>
                    {req.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeRequest.mutate({ id: req.id })}
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
