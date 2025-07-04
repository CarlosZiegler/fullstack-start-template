import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Mail,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Volume2,
} from "lucide-react";
import { useState } from "react";

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      enabled: true,
      frequency: "daily",
      marketing: false,
      security: true,
      updates: true,
    },
    push: {
      enabled: true,
      messages: true,
      comments: true,
      mentions: true,
      likes: false,
    },
    desktop: {
      enabled: false,
      sound: true,
    },
  });

  const handleNotificationChange = (
    section: string,
    key: string,
    value: boolean | string,
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], [key]: value },
    }));
    // Here you would implement the actual API call to save preferences
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive email notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={notifications.email.enabled}
              onCheckedChange={(checked) =>
                handleNotificationChange("email", "enabled", checked)
              }
            />
          </div>

          {notifications.email.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="email-frequency">Email Frequency</Label>
                    <p className="text-sm text-muted-foreground">
                      How often you want to receive email digests
                    </p>
                  </div>
                  <Select
                    value={notifications.email.frequency}
                    onValueChange={(value) =>
                      handleNotificationChange("email", "frequency", value)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="security-emails">Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important security and account notifications
                    </p>
                  </div>
                  <Switch
                    id="security-emails"
                    checked={notifications.email.security}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", "security", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="update-emails">Product Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      News about product features and updates
                    </p>
                  </div>
                  <Switch
                    id="update-emails"
                    checked={notifications.email.updates}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", "updates", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="marketing-emails">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Promotional content and special offers
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={notifications.email.marketing}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("email", "marketing", checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Control browser and mobile push notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="push-enabled">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Enable browser push notifications
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={notifications.push.enabled}
              onCheckedChange={(checked) =>
                handleNotificationChange("push", "enabled", checked)
              }
            />
          </div>

          {notifications.push.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-messages">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Direct Messages
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone sends you a direct message
                    </p>
                  </div>
                  <Switch
                    id="push-messages"
                    checked={notifications.push.messages}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", "messages", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-comments">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone comments on your posts
                    </p>
                  </div>
                  <Switch
                    id="push-comments"
                    checked={notifications.push.comments}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", "comments", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-mentions">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Mentions
                      </div>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When someone mentions you in a post or comment
                    </p>
                  </div>
                  <Switch
                    id="push-mentions"
                    checked={notifications.push.mentions}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", "mentions", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="push-likes">Likes & Reactions</Label>
                    <p className="text-sm text-muted-foreground">
                      When someone likes or reacts to your content
                    </p>
                  </div>
                  <Switch
                    id="push-likes"
                    checked={notifications.push.likes}
                    onCheckedChange={(checked) =>
                      handleNotificationChange("push", "likes", checked)
                    }
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Desktop Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Desktop Notifications
          </CardTitle>
          <CardDescription>
            Configure desktop notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="desktop-enabled">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications on your desktop
              </p>
            </div>
            <Switch
              id="desktop-enabled"
              checked={notifications.desktop.enabled}
              onCheckedChange={(checked) =>
                handleNotificationChange("desktop", "enabled", checked)
              }
            />
          </div>

          {notifications.desktop.enabled && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="desktop-sound">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Notification Sounds
                    </div>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play sound when notifications arrive
                  </p>
                </div>
                <Switch
                  id="desktop-sound"
                  checked={notifications.desktop.sound}
                  onCheckedChange={(checked) =>
                    handleNotificationChange("desktop", "sound", checked)
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Summary</CardTitle>
          <CardDescription>
            Quick overview of your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Email</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  • Notifications:{" "}
                  {notifications.email.enabled ? "Enabled" : "Disabled"}
                </p>
                {notifications.email.enabled && (
                  <>
                    <p>• Frequency: {notifications.email.frequency}</p>
                    <p>
                      • Security alerts:{" "}
                      {notifications.email.security ? "Yes" : "No"}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Push & Desktop</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  • Push notifications:{" "}
                  {notifications.push.enabled ? "Enabled" : "Disabled"}
                </p>
                <p>
                  • Desktop notifications:{" "}
                  {notifications.desktop.enabled ? "Enabled" : "Disabled"}
                </p>
                {notifications.desktop.enabled && (
                  <p>
                    • Sounds:{" "}
                    {notifications.desktop.sound ? "Enabled" : "Disabled"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
