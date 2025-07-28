import { useState, useEffect } from 'react';
import { Search, Ban, Shield, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  created_at: string;
  video_count: number;
  follower_count: number;
  roles?: Array<{ role: string }>;
  bans?: Array<{ 
    id: string;
    ban_type: string;
    reason: string;
    is_active: boolean;
    expires_at?: string;
  }>;
}

interface UserManagementProps {
  isAdmin: boolean;
}

export function UserManagement({ isAdmin }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [banDuration, setBanDuration] = useState('7'); // days
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          display_name,
          avatar_url,
          created_at,
          video_count,
          follower_count,
          user_roles!user_roles_user_id_fkey (
            role
          ),
          user_bans!user_bans_user_id_fkey (
            id,
            ban_type,
            reason,
            is_active,
            expires_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data?.map(user => ({
        ...user,
        roles: user.user_roles || [],
        bans: user.user_bans || []
      })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error loading users",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const banUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a ban reason",
        variant: "destructive"
      });
      return;
    }

    try {
      const expiresAt = banType === 'permanent' ? null : 
        new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('user_bans')
        .insert({
          user_id: selectedUser.id,
          banned_by: currentUser?.id,
          ban_type: banType,
          reason: banReason.trim(),
          expires_at: expiresAt
        });

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: currentUser?.id,
        action: `banned_user_${banType}`,
        target_user_id: selectedUser.id,
        details: {
          reason: banReason,
          duration_days: banType === 'temporary' ? parseInt(banDuration) : null
        }
      });

      toast({
        title: "User banned successfully",
        description: `${selectedUser.display_name} has been ${banType}ly banned`
      });

      setBanDialogOpen(false);
      setBanReason('');
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error banning user",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const unbanUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_logs').insert({
        admin_id: currentUser?.id,
        action: 'unbanned_user',
        target_user_id: user.id,
        details: { reason: 'Manual unban by admin' }
      });

      toast({
        title: "User unbanned",
        description: `${user.display_name} has been unbanned`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error unbanning user",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserBanned = (user: User) => {
    return user.bans?.some(ban => 
      ban.is_active && 
      (!ban.expires_at || new Date(ban.expires_at) > new Date())
    );
  };

  const getUserRole = (user: User) => {
    const roles = user.roles?.map(r => r.role) || [];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('moderator')) return 'moderator';
    return 'user';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all platform users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.display_name?.slice(0, 2).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.display_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUserRole(user) === 'admin' ? 'default' : 
                                   getUserRole(user) === 'moderator' ? 'secondary' : 'outline'}>
                        {getUserRole(user)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.video_count} videos</div>
                        <div className="text-muted-foreground">{user.follower_count} followers</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isUserBanned(user) ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isUserBanned(user) ? (
                            <DropdownMenuItem onClick={() => unbanUser(user)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setBanDialogOpen(true);
                              }}
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          {isAdmin && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                setRoleDialogOpen(true);
                              }}
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Manage Roles
                            </DropdownMenuItem>
                          )}
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

      {/* Ban User Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ban Type</Label>
              <Select value={banType} onValueChange={(value: 'temporary' | 'permanent') => setBanType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">Temporary</SelectItem>
                  <SelectItem value="permanent">Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {banType === 'temporary' && (
              <div>
                <Label>Duration (days)</Label>
                <Select value={banDuration} onValueChange={setBanDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Reason *</Label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={banUser} variant="destructive">
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}