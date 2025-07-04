import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { AdminUserList } from "./-components/admin-user-list";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        </div>
        <p className="text-muted-foreground">
          Manage your users and their roles here.
        </p>
      </div>

      <AdminUserList />
    </div>
  );
}
