import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle, Clock, MapPin, Phone, User } from "lucide-react";

export default function ProfilePage() {
  const entity = trpc.entity.getByUserId.useQuery();

  if (!entity.data) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold tracking-tight">Entity Profile</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No entity registered. Please register first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const e = entity.data;
  const typeLabels: Record<string, string> = {
    pharmacy: "Pharmacy",
    hospital: "Hospital",
    distributor: "Distributor",
    clinic: "Clinic",
  };

  const statusIcons: Record<string, { icon: typeof CheckCircle; color: string }> = {
    verified: { icon: CheckCircle, color: "text-green-500" },
    pending: { icon: Clock, color: "text-yellow-500" },
    suspended: { icon: Clock, color: "text-red-500" },
  };

  const StatusIcon = statusIcons[e.status]?.icon || Clock;
  const statusColor = statusIcons[e.status]?.color || "text-muted-foreground";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entity Profile</h1>
        <p className="text-muted-foreground">Your organization details</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Organization Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-semibold">{e.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <Badge>{typeLabels[e.type] || e.type}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                <span className="capitalize">{e.status}</span>
              </div>
            </div>
            {e.licenseNumber && (
              <div>
                <p className="text-sm text-muted-foreground">License Number</p>
                <p>{e.licenseNumber}</p>
              </div>
            )}
            {e.contactPerson && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{e.contactPerson}</span>
                </div>
              </div>
            )}
            {e.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{e.phone}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {e.regionId && (
              <div>
                <p className="text-sm text-muted-foreground">Region</p>
                <p>{e.regionId}</p>
              </div>
            )}
            {e.governorateId && (
              <div>
                <p className="text-sm text-muted-foreground">Governorate</p>
                <p>{e.governorateId}</p>
              </div>
            )}
            {e.cityId && (
              <div>
                <p className="text-sm text-muted-foreground">City</p>
                <p>{e.cityId}</p>
              </div>
            )}
            {e.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p>{e.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
