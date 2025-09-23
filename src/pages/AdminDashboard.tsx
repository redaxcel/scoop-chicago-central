import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Users, Building2, Star, MessageSquare, Calendar, Gift, BarChart3, TrendingUp, Eye, DollarSign } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalShops: number;
  totalUsers: number;
  totalReviews: number;
  totalEvents: number;
  pendingShops: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: 'shop' | 'review' | 'user' | 'event';
  title: string;
  description: string;
  created_at: string;
  status?: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    totalUsers: 0,
    totalReviews: 0,
    totalEvents: 0,
    pendingShops: 0,
    averageRating: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setProfile(profile);

        if (profile?.role === 'admin') {
          fetchDashboardData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch counts
      const [
        { count: shopsCount },
        { count: usersCount },
        { count: reviewsCount },
        { count: eventsCount },
        { count: pendingShopsCount }
      ] = await Promise.all([
        supabase.from('ice_cream_shops').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('ice_cream_shops').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      // Fetch average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating');

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      setStats({
        totalShops: shopsCount || 0,
        totalUsers: usersCount || 0,
        totalReviews: reviewsCount || 0,
        totalEvents: eventsCount || 0,
        pendingShops: pendingShopsCount || 0,
        averageRating
      });

      // Fetch recent activity
      const { data: recentShops } = await supabase
        .from('ice_cream_shops')
        .select('id, name, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentReviews } = await supabase
        .from('reviews')
        .select('id, title, content, created_at, profiles(display_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const activity: RecentActivity[] = [
        ...(recentShops?.map(shop => ({
          id: shop.id,
          type: 'shop' as const,
          title: shop.name,
          description: `New shop ${shop.status}`,
          created_at: shop.created_at,
          status: shop.status
        })) || []),
        ...(recentReviews?.map(review => ({
          id: review.id,
          type: 'review' as const,
          title: `New review by ${review.profiles?.display_name || 'Anonymous'}`,
          description: review.title || review.content.slice(0, 50) + '...',
          created_at: review.created_at
        })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      setRecentActivity(activity);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const statCards = [
    {
      title: "Total Shops",
      value: stats.totalShops,
      icon: Building2,
      description: `${stats.pendingShops} pending approval`,
      color: "text-blue-600"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-green-600"
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      description: `${stats.averageRating.toFixed(1)} avg rating`,
      color: "text-yellow-600"
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      description: "Upcoming events",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name}! Here's your Ice Cream Chicago overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest updates across your platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                          <div className="flex-shrink-0 mt-1">
                            {activity.type === 'shop' && <Building2 className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-600" />}
                            {activity.type === 'user' && <Users className="h-4 w-4 text-green-600" />}
                            {activity.type === 'event' && <Calendar className="h-4 w-4 text-purple-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </span>
                              {activity.status && (
                                <Badge variant={activity.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                                  {activity.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Building2 className="h-6 w-6 mb-2" />
                      <span className="text-xs">Manage Shops</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Users className="h-6 w-6 mb-2" />
                      <span className="text-xs">Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span className="text-xs">Add Event</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                      <Gift className="h-6 w-6 mb-2" />
                      <span className="text-xs">Add Coupon</span>
                    </Button>
                  </div>

                  {stats.pendingShops > 0 && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            {stats.pendingShops} shops awaiting approval
                          </p>
                          <p className="text-xs text-yellow-700">
                            Review and approve new shop submissions
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <CardTitle>Shop Management</CardTitle>
                <CardDescription>
                  Manage ice cream shop listings and approvals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Shop Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Detailed shop management interface coming soon
                  </p>
                  <Button>Manage Shops</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground mb-6">
                    User management interface coming soon
                  </p>
                  <Button>Manage Users</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>
                  Monitor and moderate user reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Review Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Review moderation interface coming soon
                  </p>
                  <Button>Manage Reviews</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Create and manage ice cream events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Event Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Event management interface coming soon
                  </p>
                  <Button>Manage Events</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Management</CardTitle>
                <CardDescription>
                  Create and manage discount coupons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Coupon Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Coupon management interface coming soon
                  </p>
                  <Button>Manage Coupons</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;