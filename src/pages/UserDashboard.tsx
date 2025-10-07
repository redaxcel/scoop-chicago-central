import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Star, Heart, MessageSquare, Calendar, Clock, MapPin } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
  shop_id: string;
  ice_cream_shops: {
    name: string;
  };
}

interface EventRegistration {
  id: string;
  event_id: string;
  created_at: string;
  events: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    image_url?: string;
  };
}

interface UserStats {
  totalReviews: number;
  averageRating: number;
  favoriteShops: number;
  upcomingEvents: number;
}

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalReviews: 0,
    averageRating: 0,
    favoriteShops: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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

        // All authenticated users can access their dashboard
        await fetchUserData(user.id);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user reviews with shop information
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          ice_cream_shops (
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }

      // Fetch event registrations with event details
      const { data: registrationsData } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events (
            id,
            title,
            event_date,
            location,
            image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (registrationsData) {
        setEventRegistrations(registrationsData as any);
      }

      const totalReviews = reviewsData?.length || 0;
      const averageRating = totalReviews > 0
        ? reviewsData!.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      // Count upcoming events
      const now = new Date();
      const upcomingEvents = registrationsData?.filter(
        (reg: any) => new Date(reg.events.event_date) > now
      ).length || 0;

      setStats({
        totalReviews,
        averageRating,
        favoriteShops: Math.floor(Math.random() * 5) + 1, // Mock data
        upcomingEvents
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const updateProfile = async (updatedProfile: Partial<typeof profile>) => {
    if (!profile) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...updatedProfile });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      setReviews(reviews.filter(r => r.id !== reviewId));
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete review.",
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
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'user') {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.display_name}! Track your ice cream adventures.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                Your honest opinions help others
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Your rating tendencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Events you're registered for
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews ({stats.totalReviews})</CardTitle>
                <CardDescription>
                  Manage your ice cream shop reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{review.ice_cream_shops.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge variant="secondary">
                                {review.rating}/5
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteReview(review.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        
                        {review.title && (
                          <h5 className="font-medium text-sm mb-2">{review.title}</h5>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {review.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start exploring ice cream shops and share your experiences!
                    </p>
                    <Button asChild>
                      <a href="/shops">Browse Shops</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Event Registrations ({eventRegistrations.length})</CardTitle>
                <CardDescription>
                  Events you've registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {eventRegistrations.map((registration) => {
                      const eventDate = new Date(registration.events.event_date);
                      const isUpcoming = eventDate > new Date();
                      
                      return (
                        <div key={registration.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="flex flex-col sm:flex-row">
                            {registration.events.image_url && (
                              <img
                                src={registration.events.image_url}
                                alt={registration.events.title}
                                className="w-full sm:w-48 h-32 object-cover"
                              />
                            )}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-lg">{registration.events.title}</h4>
                                  {isUpcoming ? (
                                    <Badge className="mt-1">Upcoming</Badge>
                                  ) : (
                                    <Badge variant="secondary" className="mt-1">Past Event</Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {eventDate.toLocaleDateString("en-US", {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {eventDate.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{registration.events.location}</span>
                                </div>
                                <div className="text-xs mt-2">
                                  Registered: {new Date(registration.created_at).toLocaleDateString()}
                                </div>
                              </div>

                              {isUpcoming && (
                                <Button asChild variant="outline" size="sm" className="mt-3">
                                  <Link to={`/events/${registration.events.id}`}>
                                    View Event Details
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Event Registrations</h3>
                    <p className="text-muted-foreground mb-6">
                      Discover upcoming ice cream events and register to join!
                    </p>
                    <Button asChild>
                      <Link to="/events">Browse Events</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Shops</CardTitle>
                <CardDescription>
                  Your bookmarked ice cream shops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Bookmark your favorite shops to keep track of them here.
                  </p>
                  <Button asChild>
                    <a href="/shops">Discover Shops</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input
                      id="display_name"
                      value={profile.display_name || ''}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about your ice cream preferences..."
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => updateProfile({
                      display_name: profile.display_name,
                      bio: profile.bio
                    })}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Account Type</span>
                  <Badge variant="secondary">User</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reviews Written</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalReviews}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;