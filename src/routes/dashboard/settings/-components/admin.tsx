import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth/auth-client";
import { useTranslation } from "@/lib/intl/react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash,
  UserCircle,
  AlertCircle,
  ShieldX,
} from "lucide-react";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as const,
  });
  const [isLoading, setIsLoading] = useState<string | undefined>();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });

  const { data: users, isLoading: isUsersLoading, error: usersError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        },
      );

      return data?.users || [];
    },
    retry: (failureCount, error: any) => {
      // Don't retry if it's a permission error
      if (error?.status === 403 || error?.message?.includes("forbidden")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading("create");
    try {
      const result = await authClient.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      console.log(result);
      toast.success(t("USER_CREATED_SUCCESS"));
      setNewUser({ email: "", password: "", name: "", role: "user" });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_CREATE_USER");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to create users.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleDeleteUser = async (id: string) => {
    setIsLoading(`delete-${id}`);
    try {
      const result = await authClient.admin.removeUser({ userId: id });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast.success(t("USER_DELETED_SUCCESS"));
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_DELETE_USER");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to delete users.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleRevokeSessions = async (id: string) => {
    setIsLoading(`revoke-${id}`);
    try {
      const result = await authClient.admin.revokeUserSessions({ userId: id });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast.success(t("SESSIONS_REVOKED_SUCCESS"));
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_REVOKE_SESSIONS");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to revoke user sessions.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleImpersonateUser = async (id: string) => {
    setIsLoading(`impersonate-${id}`);
    try {
      const result = await authClient.admin.impersonateUser({ userId: id });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast.success(t("IMPERSONATED_USER"));
      navigate({ to: "/" });
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_IMPERSONATE_USER");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to impersonate users.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(`ban-${banForm.userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error(t("EXPIRATION_DATE_REQUIRED"));
      }
      
      const result = await authClient.admin.banUser({
        userId: banForm.userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - new Date().getTime(),
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast.success(t("USER_BANNED_SUCCESS"));
      setIsBanDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_BAN_USER");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to ban users.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setIsLoading(`role-${userId}`);
    try {
      const result = await authClient.admin.updateUser({
        userId: userId,
        data: {
          role: newRole,
        },
      });
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast.success(t("USER_ROLE_UPDATED_SUCCESS"));
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    } catch (error: any) {
      const errorMessage = error?.message || t("FAILED_TO_UPDATE_USER_ROLE");
      if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
        toast.error("Access denied. You don't have permission to update user roles.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster richColors />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{t("ADMIN_DASHBOARD")}</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t("CREATE_USER")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("CREATE_USER")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">{t("PASSWORD")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name">{t("NAME")}</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">{t("ROLE")}</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value: "admin" | "user") =>
                      setNewUser({ ...newUser, role: value as "user" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("ADMIN")}</SelectItem>
                      <SelectItem value="user">{t("USER")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === "create"}
                >
                  {isLoading === "create" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("CREATING")}
                    </>
                  ) : (
                    t("CREATE_USER")
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("BAN_USER")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBanUser} className="space-y-4">
                <div>
                  <Label htmlFor="reason">{t("REASON")}</Label>
                  <Input
                    id="reason"
                    value={banForm.reason}
                    onChange={(e) =>
                      setBanForm({ ...banForm, reason: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expirationDate">{t("EXPIRATION_DATE")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="expirationDate"
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !banForm.expirationDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {banForm.expirationDate ? (
                          format(banForm.expirationDate, "PPP")
                        ) : (
                          <span>{t("PICK_A_DATE")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={banForm.expirationDate}
                        onSelect={(date) =>
                          setBanForm({ ...banForm, expirationDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading === `ban-${banForm.userId}`}
                >
                  {isLoading === `ban-${banForm.userId}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("BANNING")}
                    </>
                  ) : (
                    t("BAN_USER")
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {usersError && (
            <Alert variant="destructive" className="mb-6">
              <ShieldX className="h-4 w-4" />
              <AlertDescription>
                {usersError?.message?.includes("403") || usersError?.message?.includes("forbidden") 
                  ? "Access denied. You don't have admin privileges to view this section."
                  : usersError?.message || "Failed to load admin dashboard. Please try again later."}
              </AlertDescription>
            </Alert>
          )}
          
          {isUsersLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : usersError ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-4">
                <ShieldX className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium">Admin Access Required</p>
                  <p className="text-sm text-muted-foreground">
                    Contact your administrator to gain access to this section
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("EMAIL")}</TableHead>
                  <TableHead>{t("NAME")}</TableHead>
                  <TableHead>{t("ROLE")}</TableHead>
                  <TableHead>{t("BANNED")}</TableHead>
                  <TableHead>{t("ACTIONS")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role || "user"}
                        onValueChange={(value) =>
                          handleUpdateUserRole(user.id, value)
                        }
                        disabled={isLoading === `role-${user.id}`}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">{t("ADMIN")}</SelectItem>
                          <SelectItem value="user">{t("USER")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">{t("YES")}</Badge>
                      ) : (
                        <Badge variant="outline">{t("NO")}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isLoading?.startsWith("delete")}
                        >
                          {isLoading === `delete-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSessions(user.id)}
                          disabled={isLoading?.startsWith("revoke")}
                        >
                          {isLoading === `revoke-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleImpersonateUser(user.id)}
                          disabled={isLoading?.startsWith("impersonate")}
                        >
                          {isLoading === `impersonate-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCircle className="h-4 w-4 mr-2" />
                              {t("IMPERSONATE")}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            setBanForm({
                              userId: user.id,
                              reason: "",
                              expirationDate: undefined,
                            });
                            if (user.banned) {
                              setIsLoading(`ban-${user.id}`);
                              await authClient.admin.unbanUser(
                                {
                                  userId: user.id,
                                },
                                {
                                  onError(context) {
                                    toast.error(
                                      context.error.message ||
                                        t("FAILED_TO_UNBAN_USER"),
                                    );
                                    setIsLoading(undefined);
                                  },
                                  onSuccess() {
                                    queryClient.invalidateQueries({
                                      queryKey: ["users"],
                                    });
                                    toast.success(t("USER_UNBANNED_SUCCESS"));
                                  },
                                },
                              );
                              queryClient.invalidateQueries({
                                queryKey: ["users"],
                              });
                            } else {
                              setIsBanDialogOpen(true);
                            }
                          }}
                          disabled={isLoading?.startsWith("ban")}
                        >
                          {isLoading === `ban-${user.id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.banned ? (
                            t("UNBAN")
                          ) : (
                            t("BAN")
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
