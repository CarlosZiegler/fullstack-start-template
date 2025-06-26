import { createFileRoute } from "@tanstack/react-router"
import { authClient } from "@/lib/auth/auth-client";
import { useQuery } from "@tanstack/react-query";
import AdminDashboard from "./-components/admin";
import { OrganizationCard } from "./-components/organization-card";
import UserCard from "./-components/user-card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/intl/react";

export const Route = createFileRoute("/dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions"],
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
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive text-sm mb-2">Error loading settings</p>
          <p className="text-muted-foreground text-xs">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("SETTINGS")}</h1>
        <p className="text-muted-foreground">
          Manage your account, organization, and security settings
        </p>
      </div>
      
      <Separator />
      
      <div className="grid gap-8">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{t("ORGANIZATION")}</h2>
            <p className="text-sm text-muted-foreground">
              Manage your organization settings and member access
            </p>
          </div>
          <OrganizationCard
            session={data?.session?.data || null}
            activeOrganization={data?.organization?.data}
          />
        </section>

        <Separator />

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">
              Manage your personal account settings and security preferences
            </p>
          </div>
          <UserCard activeSessions={data?.sessions?.data || []} />
        </section>

        {/* Only show admin section if user has admin role */}
        {data?.session?.data?.user?.role === 'admin' && (
          <>
            <Separator />
            <section className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{t("ADMIN_DASHBOARD")}</h2>
                <p className="text-sm text-muted-foreground">
                  Administrative tools and user management (admin only)
                </p>
              </div>
              <AdminDashboard />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
