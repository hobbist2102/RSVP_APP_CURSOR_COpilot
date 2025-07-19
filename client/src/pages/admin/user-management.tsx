import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Calendar,
  MoreHorizontal,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { get, post, put, del } from "@/lib/api";
import AdminLayout from "@/components/layout/admin-layout";
import { getCardClasses } from "@/design-system";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'couple' | 'guest';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => get('/api/admin/users'),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => del(`/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      put(`/api/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'couple': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'couple': return 'default';
      default: return 'secondary';
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleUserStatus = (userId: number, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className={getCardClasses('elevated')}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Users</h3>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : 'Failed to load users'}
                </p>
                <Button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] })}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage system users and their permissions
            </p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Administrators</p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Couples</p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.role === 'couple').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card className={getCardClasses('default')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className={getCardClasses('default')}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={roleFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("all")}
                >
                  All Roles
                </Button>
                <Button
                  variant={roleFilter === "admin" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("admin")}
                >
                  Admins
                </Button>
                <Button
                  variant={roleFilter === "couple" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRoleFilter("couple")}
                >
                  Couples
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className={getCardClasses('default')}>
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Users className="h-5 w-5 mr-2" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium">No users found</p>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search criteria" : "No users have been created yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center w-fit">
                          {getRoleIcon(user.role)}
                          <span className="ml-1 capitalize">{user.role}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                            >
                              <User className="h-4 w-4 mr-2" />
                              {user.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}