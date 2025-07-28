import { useState, useEffect } from 'react';
import { Users, Video, Heart, MessageCircle, Shield, Ban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  totalUsers: number;
  totalVideos: number;
  totalLikes: number;
  totalComments: number;
  totalBans: number;
  activeBans: number;
  newUsersToday: number;
  newVideosToday: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalVideos: 0,
    totalLikes: 0,
    totalComments: 0,
    totalBans: 0,
    activeBans: 0,
    newUsersToday: 0,
    newVideosToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [
        usersResult,
        videosResult,
        likesResult,
        commentsResult,
        bansResult,
        activeBansResult,
        newUsersResult,
        newVideosResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('videos').select('id', { count: 'exact' }),
        supabase.from('likes').select('id', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' }),
        supabase.from('user_bans').select('id', { count: 'exact' }),
        supabase.from('user_bans').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact' }).gte('created_at', todayISO),
        supabase.from('videos').select('id', { count: 'exact' }).gte('created_at', todayISO),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalVideos: videosResult.count || 0,
        totalLikes: likesResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalBans: bansResult.count || 0,
        activeBans: activeBansResult.count || 0,
        newUsersToday: newUsersResult.count || 0,
        newVideosToday: newVideosResult.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    loading: isLoading 
  }: { 
    title: string; 
    value: number; 
    description: string; 
    icon: any; 
    loading: boolean;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          ) : (
            value.toLocaleString()
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description={`+${stats.newUsersToday} today`}
          icon={Users}
          loading={loading}
        />
        <StatCard
          title="Total Videos"
          value={stats.totalVideos}
          description={`+${stats.newVideosToday} today`}
          icon={Video}
          loading={loading}
        />
        <StatCard
          title="Total Likes"
          value={stats.totalLikes}
          description="All-time engagements"
          icon={Heart}
          loading={loading}
        />
        <StatCard
          title="Total Comments"
          value={stats.totalComments}
          description="All-time interactions"
          icon={MessageCircle}
          loading={loading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Active Bans"
          value={stats.activeBans}
          description={`${stats.totalBans} total bans`}
          icon={Ban}
          loading={loading}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              System Health
            </CardTitle>
            <CardDescription>Platform status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">User Growth Rate</span>
                <span className="text-sm font-medium text-green-600">+{stats.newUsersToday} today</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Content Creation</span>
                <span className="text-sm font-medium text-blue-600">+{stats.newVideosToday} videos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ban Rate</span>
                <span className="text-sm font-medium text-orange-600">
                  {stats.totalUsers > 0 ? ((stats.activeBans / stats.totalUsers) * 100).toFixed(2) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}