import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, Crown, User, Shield, Trash2, Edit } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  bio?: string;
  avatar_url?: string;
}

export const UsersManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({ title: "Failed", description: "Could not update user role", variant: "destructive" });
    } else {
      toast({ title: "User role updated" });
      fetchUsers();
      setSelected(null);
    }
  };

  const saveUser = async () => {
    if (!selected) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: selected.display_name,
        role: selected.role,
        bio: selected.bio
      })
      .eq('id', selected.id);

    if (error) {
      toast({ title: "Failed", description: "Could not update user", variant: "destructive" });
    } else {
      toast({ title: "User updated successfully" });
      fetchUsers();
      setSelected(null);
    }
  };

  const filtered = users.filter(user => {
    const matchesSearch = [user.display_name, user.bio].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return "default" as const;
      case 'moderator':
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Management</h3>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> All Users ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.display_name || 'Unnamed User'}</div>
                            {user.bio && (
                              <div className="text-xs text-muted-foreground truncate max-w-48">
                                {user.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role.replace('_', ' ')}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setSelected(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
              <Crown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'moderator').length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regular Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'user').length}</p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Edit User: {selected.display_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input 
                  value={selected.display_name || ''} 
                  onChange={(e) => setSelected({ ...selected, display_name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={selected.role} 
                  onValueChange={(value) => setSelected({ ...selected, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bio</Label>
              <Input 
                value={selected.bio || ''} 
                onChange={(e) => setSelected({ ...selected, bio: e.target.value })}
                placeholder="User bio..." 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button onClick={saveUser}>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UsersManager;