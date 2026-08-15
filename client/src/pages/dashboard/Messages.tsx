import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MessagesPage() {
  const { t } = useLanguage();
  const conversations = trpc.conversations.list.useQuery();
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const selectedConv = conversations.data?.find((c) => c.id === selectedConvId);
  const messages = trpc.conversations.messages.useQuery(
    { conversationId: selectedConvId! },
    { enabled: !!selectedConvId }
  );

  const sendMessage = trpc.conversations.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      if (selectedConvId) {
        trpc.useUtils().conversations.messages.invalidate({ conversationId: selectedConvId });
        trpc.useUtils().conversations.list.invalidate();
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const revealContact = trpc.conversations.revealContact.useMutation({
    onSuccess: () => {
      toast.success(t("Contact info shared"));
      trpc.useUtils().conversations.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("Messages")}</h1>
        <p className="text-muted-foreground">{t("Chat with matched entities")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Conversation List */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold text-sm">{t("Conversations")}</h3>
            {conversations.isLoading ? (
              <p className="text-sm text-muted-foreground">{t("Loading...")}</p>
            ) : !conversations.data?.length ? (
              <p className="text-sm text-muted-foreground">{t("No conversations yet")}</p>
            ) : (
              <div className="space-y-2">
                {conversations.data.map((conv) => (
                  <button
                    key={conv.id}
                    className={`w-full text-start rounded-lg border p-3 transition-colors ${
                      selectedConvId === conv.id ? "border-primary bg-primary/5" : "border-border/50 hover:bg-accent/50"
                    }`}
                    onClick={() => setSelectedConvId(conv.id)}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {t("Match")} <span className="ltr-value">#{conv.matchId}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conv.contactRevealed ? t("Contact revealed") : t("Contact hidden")}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card>
          {selectedConv ? (
            <>
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <p className="font-semibold">{t("Match")} <span className="ltr-value">#{selectedConv.matchId}</span></p>
                  {selectedConv.contactRevealed && (
                    <Badge variant="default" className="mt-1">{t("Contact Revealed")}</Badge>
                  )}
                </div>
                {!selectedConv.contactRevealed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revealContact.mutate({ conversationId: selectedConv.id })}
                  >
                    {t("Reveal Contact")}
                  </Button>
                )}
              </div>

              <div className="h-[400px] overflow-y-auto p-4">
                {messages.isLoading ? (
                  <p className="text-muted-foreground">{t("Loading messages...")}</p>
                ) : !messages.data?.length ? (
                  <p className="text-muted-foreground text-sm">{t("No messages yet. Start the conversation.")}</p>
                ) : (
                  <div className="space-y-3">
                    {messages.data.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                          msg.senderEntityId === (selectedConv.offerEntityId)
                            ? "bg-primary text-primary-foreground ms-auto"
                            : "bg-muted"
                        }`}
                      >
                        {msg.messageText}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("Type a message...")}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && messageText.trim()) {
                        sendMessage.mutate({ conversationId: selectedConv.id, messageText: messageText.trim() });
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() => {
                      if (messageText.trim()) {
                        sendMessage.mutate({ conversationId: selectedConv.id, messageText: messageText.trim() });
                      }
                    }}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-muted-foreground">{t("Select a conversation to start messaging")}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
