import { useState, useEffect } from 'react';
import { Ban, Globe, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Ban {
  id: string;
  ban_type: string;
  reason: string;
  banned_at: string;
  expires_at?: string;
  is_active: boolean;
  profiles?: {
    display_name: string;
    username: string;
  };
}

export function BanManagement() {
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBans();
  }, []);

  const fetchBans = async () => {
    try {
      const { data, error } = await supabase
        .from('user_bans')
        .select(`
          id,
          ban_type,
          reason,
          banned_at,
          expires_at,
          is_active,
          profiles:user_id (
            display_name,
            username
          )
        `)
        .order('banned_at', { ascending: false });

      if (error) throw error;
      setBans(data || []);
    } catch (error) {
      console.error('Error fetching bans:', error);
      toast({
        title: "Error loading bans",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          Ban Management
        </CardTitle>
        <CardDescription>
          View and manage user bans
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : bans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bans found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bans.map((ban) => (
                <TableRow key={ban.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{ban.profiles?.display_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground">@{ban.profiles?.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ban.ban_type === 'permanent' ? 'destructive' : 'secondary'}>
                      {ban.ban_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{ban.reason}</TableCell>
                  <TableCell>
                    <Badge variant={ban.is_active ? 'destructive' : 'outline'}>
                      {ban.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ban.banned_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}