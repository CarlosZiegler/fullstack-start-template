import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth/auth-client";
import type { AuthClient } from "@/lib/auth/auth-client";
import {
  AlertTriangle,
  Clock,
  Key,
  Laptop,
  MapPin,
  Monitor,
  PhoneIcon,
  Shield,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { UAParser } from "ua-parser-js";

interface SecuritySettingsProps {
  session: AuthClient["$Infer"]["Session"]["session"] | null | undefined;
  activeSessions: AuthClient["$Infer"]["Session"]["session"][];
}

export function SecuritySettings({
  session,
  activeSessions,
}: SecuritySettingsProps) {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: session?.user?.twoFactorEnabled || false,
    loginNotifications: true,
    suspiciousActivity: true,
    sessionTimeout: false,
  });

  const handleSecurityToggle = (setting: string, value: boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [setting]: value }));
    // Here you would implement the actual API call to update settings
  };

  const getDeviceIcon = (userAgent: string) => {
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    return device.type === "mobile" ? (
      <PhoneIcon className="h-4 w-4" />
    ) : (
      <Laptop className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a
            verification code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  Two-factor authentication is{" "}
                  {securitySettings.twoFactorEnabled ? "enabled" : "disabled"}
                </p>
                <Badge
                  variant={
                    securitySettings.twoFactorEnabled ? "default" : "secondary"
                  }
                >
                  {securitySettings.twoFactorEnabled ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {securitySettings.twoFactorEnabled
                  ? "Your account is protected with 2FA"
                  : "Enable 2FA to secure your account"}
              </p>
            </div>
            <Button
              variant={
                securitySettings.twoFactorEnabled ? "destructive" : "default"
              }
              onClick={() =>
                handleSecurityToggle(
                  "twoFactorEnabled",
                  !securitySettings.twoFactorEnabled,
                )
              }
            >
              {securitySettings.twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>

          {securitySettings.twoFactorEnabled && (
            <div className="space-y-2 border-t pt-4">
              <h4 className="text-sm font-medium">Recovery Options</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Key className="mr-2 h-4 w-4" />
                  View Recovery Codes
                </Button>
                <Button variant="outline" size="sm">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Add Authenticator App
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription>
            Configure your security settings and notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="login-notifications">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your account is accessed from a new device
                </p>
              </div>
              <Switch
                id="login-notifications"
                checked={securitySettings.loginNotifications}
                onCheckedChange={(checked) =>
                  handleSecurityToggle("loginNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="suspicious-activity">
                  Suspicious Activity Alerts
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for unusual account activity
                </p>
              </div>
              <Switch
                id="suspicious-activity"
                checked={securitySettings.suspiciousActivity}
                onCheckedChange={(checked) =>
                  handleSecurityToggle("suspiciousActivity", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after 30 minutes of inactivity
                </p>
              </div>
              <Switch
                id="session-timeout"
                checked={securitySettings.sessionTimeout}
                onCheckedChange={(checked) =>
                  handleSecurityToggle("sessionTimeout", checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage your active sessions across different devices and browsers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions
              ?.filter((s) => s.userAgent)
              ?.map((sessionItem, index) => {
                const parser = new UAParser(sessionItem.userAgent || "");
                const os = parser.getOS();
                const browser = parser.getBrowser();
                const isCurrentSession =
                  sessionItem.id === session?.session?.id;

                return (
                  <div
                    key={sessionItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getDeviceIcon(sessionItem.userAgent || "")}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {os.name || "Unknown"} •{" "}
                            {browser.name || "Unknown Browser"}
                          </p>
                          {isCurrentSession && (
                            <Badge variant="default" className="text-xs">
                              Current Session
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {sessionItem.ipAddress || "Unknown Location"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Last active:{" "}
                              {new Date(
                                sessionItem.updatedAt,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!isCurrentSession && (
                      <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        End Session
                      </Button>
                    )}
                  </div>
                );
              })}

            {(!activeSessions || activeSessions.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <Monitor className="mx-auto h-12 w-12 mb-2" />
                <p>No active sessions found</p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Security Actions</p>
              <p className="text-sm text-muted-foreground">
                Take immediate action to secure your account
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Change Password
              </Button>
              <Button variant="destructive" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
