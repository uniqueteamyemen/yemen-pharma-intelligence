import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const notifications = trpc.notifications.list.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      toast.success("All notifications marked as read");
      utils.notifications.list.invalidate();
    },
  });

  const typeIcons: Record<string, string> = {
    match_found: "New Match",
    message_received: "New Message",
    market_signal: "Market Signal",
    entity_approved: "Entity Approved",
    offer_matched: "Offer Matched",
    request_matched: "Request Matched",
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Your activity alerts and updates</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllRead.mutate()}
          disabled={!notifications.data?.some((n) => !n.isRead)}
        >
          <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {notifications.data?.filter((n) => !n.isRead).length ?? 0} Unread
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : !notifications.data?.length ? (
            <div className="text-center py-8">
              <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.data.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    !notif.isRead ? "border-primary/30 bg-primary/5" : "border-border/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={!notif.isRead ? "default" : "outline"} className="text-xs">
                        {typeIcons[notif.type] || notif.type}
                      </Badge>
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 font-medium text-sm">{notif.title}</p>
                    {notif.body && (
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate({ id: notif.id })}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
