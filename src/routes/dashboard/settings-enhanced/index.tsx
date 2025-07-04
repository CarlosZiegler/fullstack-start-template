import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Settings } from "lucide-react";
import { OrganizationCard } from "../settings/-components/organization-card";
import { AppearanceSettings } from "./-components/appearance-settings";
import { EnhancedUserProfile } from "./-components/enhanced-user-profile";
import { NotificationSettings } from "./-components/notification-settings";
import { SecuritySettings } from "./-components/security-settings";

export const Route = createFileRoute("/dashboard/settings-enhanced/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ["enhanced-settings"],
    queryFn: async () => {
      const getSession = authClient.getSession();
      const getSessions = authClient.listSessions();
      const getOrganization = authClient.organization.getFullOrganization();
      const [session, organization, sessions] = await Promise.all([
        getSession,
        getOrganization,
        getSessions,
      ]);
      return { session, organization, sessions } as const;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">
            Error loading settings
          </p>
          <p className="text-muted-foreground text-xs">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">{t("SETTINGS")}</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Separator />

      {/* Settings Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">
                This is how others will see you on the site.
              </p>
            </div>
            <EnhancedUserProfile session={data?.session?.data} />
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">
                Manage your security preferences and authentication settings
              </p>
            </div>
            <SecuritySettings
              session={data?.session?.data}
              activeSessions={data?.sessions?.data || []}
            />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize how the interface looks and feels for you
              </p>
            </div>
            <AppearanceSettings />
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Configure how you receive notifications
              </p>
            </div>
            <NotificationSettings />
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{t("ORGANIZATION")}</h2>
              <p className="text-sm text-muted-foreground">
                Manage your organization settings and member access
              </p>
            </div>
            <OrganizationCard
              session={data?.session?.data}
              activeOrganization={data?.organization?.data}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
