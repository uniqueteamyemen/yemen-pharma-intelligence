import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CompactBrandIcon } from "@/components/CompactBrandIcon";

export default function RegisterPage() {
  const { t } = useLanguage();
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
      toast.success(t("Registration submitted for review"));
      utils.entity.getByUserId.invalidate();
    },
    onError: (err) => toast.error(err.message || t("Unable to submit registration")),
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
        <div className="flex items-center gap-3">
          <CompactBrandIcon size="md" />
          <h1 className="text-2xl font-bold tracking-tight">{t("Entity Registration")}</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            {entity.data.status === "verified" ? (
              <>
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold mb-2">{t("Entity Verified")}</h2>
                <p className="text-muted-foreground">{entity.data.name} {t("is verified and active.")}</p>
              </>
            ) : entity.data.status === "pending" ? (
              <>
                <Clock className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
                <h2 className="text-xl font-semibold mb-2">{t("Pending Verification")}</h2>
                <p className="text-muted-foreground">{t("Your registration is being reviewed by an administrator.")}</p>
              </>
            ) : (
              <>
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">{t("Entity Status")}: {t(entity.data.status, entity.data.status)}</h2>
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
        <div className="flex items-center gap-3">
          <CompactBrandIcon size="md" />
          <h1 className="text-2xl font-bold tracking-tight">{t("Entity Registration")}</h1>
        </div>
        <p className="text-muted-foreground">{t("Register your pharmacy, hospital, distributor, or clinic")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CompactBrandIcon size="sm" />
            {t("Registration Form")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-xl">
            <div className="space-y-2">
              <Label>{t("Entity Name")} *</Label>
              <Input placeholder={t("e.g., Al-Amal Pharmacy")} value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t("Type")} *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder={t("Select type")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pharmacy">{t("Pharmacy")}</SelectItem>
                  <SelectItem value="hospital">{t("Hospital")}</SelectItem>
                  <SelectItem value="distributor">{t("Distributor")}</SelectItem>
                  <SelectItem value="clinic">{t("Clinic")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("License Number")}</Label>
              <Input placeholder={t("Optional")} value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t("Contact Person")}</Label>
              <Input placeholder={t("Optional")} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t("Phone")}</Label>
              <Input placeholder={t("Optional")} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Region")}</Label>
                <Select value={regionId} onValueChange={(v) => { setRegionId(v); setGovernorateId(""); }}>
                  <SelectTrigger><SelectValue placeholder={t("Select region")} /></SelectTrigger>
                  <SelectContent>
                    {geography.data?.regions.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("Governorate")}</Label>
                <Select value={governorateId} onValueChange={(v) => { setGovernorateId(v); setCityId(""); }}>
                  <SelectTrigger><SelectValue placeholder={t("Select governorate")} /></SelectTrigger>
                  <SelectContent>
                    {filteredGovernorates.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>{g.nameAr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
                <Label>{t("City")}</Label>
              <Select value={cityId} onValueChange={setCityId}>
                <SelectTrigger><SelectValue placeholder={t("Select city")} /></SelectTrigger>
                <SelectContent>
                  {filteredCities.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nameAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("Address")}</Label>
              <Input placeholder={t("Optional")} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!name || !type}
            >
              {t("Submit Registration")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
