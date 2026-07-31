import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, CheckCircle, Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const entity = trpc.entity.getByUserId.useQuery();
  const geography = trpc.geography.getAll.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [regionId, setRegionId] = useState("");
  const [governorateId, setGovernorateId] = useState("");
  const [cityId, setCityId] = useState("");
  const [address, setAddress] = useState("");

  const createEntity = trpc.entity.create.useMutation({
    onSuccess: () => {
      toast.success("Registration submitted for review");
      utils.entity.getByUserId.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    createEntity.mutate({
      name,
      type: type as any,
      licenseNumber: licenseNumber || undefined,
      contactPerson: contactPerson || undefined,
      phone: phone || undefined,
      regionId: regionId ? parseInt(regionId) : undefined,
      governorateId: governorateId ? parseInt(governorateId) : undefined,
      cityId: cityId ? parseInt(cityId) : undefined,
      address: address || undefined,
    });
  };

  // If already registered, show status
  if (entity.data) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Entity Registration</h1>
        <Card>
          <CardContent className="p-8 text-center">
            {entity.data.status === "verified" ? (
              <>
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold mb-2">Entity Verified</h2>
                <p className="text-muted-foreground">{entity.data.name} is verified and active.</p>
              </>
            ) : entity.data.status === "pending" ? (
              <>
                <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                <h2 className="text-xl font-semibold mb-2">Pending Verification</h2>
                <p className="text-muted-foreground">Your registration is being reviewed by an administrator.</p>
              </>
            ) : (
              <>
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Entity Status: {entity.data.status}</h2>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredGovernorates = geography.data?.governorates.filter(
    (g) => !regionId || g.regionId === parseInt(regionId)
  ) || [];

  const filteredCities = geography.data?.cities.filter(
    (c) => !governorateId || c.governorateId === parseInt(governorateId)
  ) || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entity Registration</h1>
        <p className="text-muted-foreground">Register your pharmacy, hospital, distributor, or clinic</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Registration Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label>Entity Name *</Label>
              <Input placeholder="e.g., Al-Amal Pharmacy" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="distributor">Distributor</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>License Number</Label>
              <Input placeholder="Optional" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input placeholder="Optional" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="Optional" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={regionId} onValueChange={(v) => { setRegionId(v); setGovernorateId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                  <SelectContent>
                    {geography.data?.regions.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Governorate</Label>
                <Select value={governorateId} onValueChange={(v) => { setGovernorateId(v); setCityId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Select governorate" /></SelectTrigger>
                  <SelectContent>
                    {filteredGovernorates.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {filteredCities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="Optional" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!name || !type}
            >
              Submit Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
