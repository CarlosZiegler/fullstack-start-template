import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  ShieldX,
  SortAsc,
  SortDesc,
  UserPlus,
} from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  createdAt: Date;
  lastActive?: Date;
}

// Mock data - replace with your actual data fetching
const mockUsers: User[] = [
  {
    id: "1",
    name: "Chauncey Smith",
    email: "chauncey_koepp@yahoo.com",
    role: "admin",
    banned: false,
    emailVerified: true,
    createdAt: new Date("2024-01-15"),
    lastActive: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Bailey Simonis",
    email: "bailey49@hotmail.com",
    role: "user",
    banned: false,
    emailVerified: false,
    createdAt: new Date("2024-01-10"),
    lastActive: new Date("2024-01-18"),
  },
  {
    id: "3",
    name: "Lavonne Heathcote",
    email: "lavonne_effertz39@yahoo.com",
    role: "admin",
    banned: false,
    emailVerified: true,
    createdAt: new Date("2024-01-05"),
    lastActive: new Date("2024-01-19"),
  },
  {
    id: "4",
    name: "Efren Homenick",
    email: "efren.emard@gmail.com",
    role: "user",
    banned: false,
    emailVerified: false,
    createdAt: new Date("2024-01-08"),
    lastActive: new Date("2024-01-17"),
  },
  {
    id: "5",
    name: "Chloe Reichert",
    email: "chloe.little86@hotmail.com",
    role: "admin",
    banned: true,
    emailVerified: true,
    createdAt: new Date("2024-01-12"),
    lastActive: new Date("2024-01-15"),
  },
];

type SortField = "name" | "email" | "role" | "createdAt" | "lastActive";
type SortDirection = "asc" | "desc";

export function AdminUserList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // In a real app, this would fetch from your backend
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-users",
      searchTerm,
      statusFilter,
      roleFilter,
      sortField,
      sortDirection,
    ],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredUsers = [...mockUsers];

      // Filter by search term
      if (searchTerm) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // Filter by status
      if (statusFilter !== "all") {
        filteredUsers = filteredUsers.filter((user) => {
          switch (statusFilter) {
            case "active":
              return !user.banned && user.emailVerified;
            case "inactive":
              return !user.banned && !user.emailVerified;
            case "banned":
              return user.banned;
            default:
              return true;
          }
        });
      }

      // Filter by role
      if (roleFilter !== "all") {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === roleFilter,
        );
      }

      // Sort
      filteredUsers.sort((a, b) => {
        const getValue = (user: User, field: SortField): string | number => {
          const value = user[field];
          if (field === "createdAt" || field === "lastActive") {
            return value instanceof Date ? value.getTime() : 0;
          }
          return typeof value === "string" ? value.toLowerCase() : "";
        };

        const aValue = getValue(a, sortField);
        const bValue = getValue(b, sortField);

        const result = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortDirection === "asc" ? result : -result;
      });

      return filteredUsers;
    },
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadge = (user: User) => {
    if (user.banned) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.emailVerified) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          Active
        </Badge>
      );
    }
    return <Badge variant="secondary">Invited</Badge>;
  };

  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return (
        <Badge variant="outline" className="text-purple-700 border-purple-200">
          Admin
        </Badge>
      );
    }
    return <Badge variant="outline">User</Badge>;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="ml-1 h-4 w-4" />
    ) : (
      <SortDesc className="ml-1 h-4 w-4" />
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ShieldX className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Error loading users</h3>
            <p className="text-muted-foreground">Please try again later</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle className="text-2xl">User List</CardTitle>
          <div className="flex gap-2">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="banned">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground flex items-center"
                  onClick={() => handleSort("email")}
                >
                  Email
                  <SortIcon field="email" />
                </TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center">
                    Role
                    <SortIcon field="role" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>
                          +1
                          {Math.floor(Math.random() * 9000000000) + 1000000000}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Activity className="mr-2 h-4 w-4" />
                            View Activity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.banned ? (
                            <DropdownMenuItem className="cursor-pointer text-green-600">
                              <Shield className="mr-2 h-4 w-4" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="cursor-pointer text-red-600">
                              <ShieldX className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="h-12 w-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">No users found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            {users
              ? `${users.length} of ${mockUsers.length} user(s)`
              : "0 of 0 user(s)"}
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
