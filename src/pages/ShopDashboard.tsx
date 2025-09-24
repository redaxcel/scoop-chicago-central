import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Building2, Star, MessageSquare, BarChart3, Camera, Settings, MapPin, Phone, Globe, Upload } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  phone?: string;
  pricing?: "$" | "$$" | "$$$" | "$$$$";
  image_url?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  amenities?: string[];
  hours?: any;
  status: "active" | "pending" | "closed" | "suspended";
  gallery_images?: string[];
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name?: string;
  } | null;
}

interface ShopStats {
  totalReviews: number;
  averageRating: number;
  monthlyViews: number;
  recentReviews: Review[];
}

const ShopDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats>({
    totalReviews: 0,
    averageRating: 0,
    monthlyViews: 0,
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

        if (profile) {
          await fetchShopData(profile.id);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopData = async (profileId: string) => {
    try {
      // Fetch shop owned by this user
      const { data: shopData } = await supabase
        .from('ice_cream_shops')
        .select('*')
        .eq('owner_profile_id', profileId)
        .single();

      if (shopData) {
        setShop(shopData);

        // Fetch reviews for this shop
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*')
          .eq('shop_id', shopData.id)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          const totalReviews = reviewsData.length;
          const averageRating = totalReviews > 0
            ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

          // Get profiles for recent reviews
          const recentReviewIds = reviewsData.slice(0, 5).map(r => r.user_id);
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, display_name')
            .in('user_id', recentReviewIds);

          const recentReviews = reviewsData.slice(0, 5).map(review => ({
            ...review,
            profiles: profilesData?.find(p => p.user_id === review.user_id) || null
          }));

          setStats({
            totalReviews,
            averageRating,
            monthlyViews: Math.floor(Math.random() * 1000) + 500, // Mock data
            recentReviews
          });
        }
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  };

  const handleShopUpdate = async (updatedShop: Partial<Shop>) => {
    if (!shop) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ice_cream_shops')
        .update(updatedShop)
        .eq('id', shop.id);

      if (error) throw error;

      setShop({ ...shop, ...updatedShop });
      toast({
        title: "Shop Updated",
        description: "Your shop information has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating shop:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update shop information.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">No Shop Found</h1>
          <p className="text-muted-foreground mb-6">
            You don't have a shop associated with your account yet.
          </p>
          <Button asChild>
            <a href="/submit-shop">Submit Your Shop</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your ice cream shop: {shop.name}
          </p>
          <Badge variant={shop.status === 'active' ? 'default' : 'secondary'} className="mt-2">
            {shop.status}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                {stats.averageRating.toFixed(1)} average rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyViews}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{shop.status}</div>
              <p className="text-xs text-muted-foreground">
                {shop.status === 'active' ? 'Visible to customers' : 'Under review'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Settings className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {shop.image_url && shop.description && shop.hours ? '100%' : '75%'}
              </div>
              <p className="text-xs text-muted-foreground">
                Complete your profile
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Shop Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentReviews.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentReviews.map((review) => (
                        <div key={review.id} className="border-b pb-3 last:border-b-0">
                          <div className="flex items-center gap-2 mb-1">
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
                            <span className="text-sm font-medium">
                              {review.profiles?.display_name || 'Anonymous'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {review.content.slice(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No reviews yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Update Hours
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Respond to Reviews
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>
                  Update your shop details to attract more customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Shop Name</Label>
                    <Input
                      id="name"
                      value={shop.name}
                      onChange={(e) => setShop({ ...shop, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shop.phone || ''}
                      onChange={(e) => setShop({ ...shop, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={shop.description || ''}
                    onChange={(e) => setShop({ ...shop, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricing">Pricing</Label>
                    <Select
                      value={shop.pricing || ''}
                      onValueChange={(value: "$" | "$$" | "$$$" | "$$$$") => 
                        setShop({ ...shop, pricing: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget Friendly</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Premium</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={shop.website_url || ''}
                      onChange={(e) => setShop({ ...shop, website_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={shop.facebook_url || ''}
                      onChange={(e) => setShop({ ...shop, facebook_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleShopUpdate(shop)}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Shop'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  Monitor and respond to customer feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {review.profiles?.display_name || 'Anonymous'}
                              </span>
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
                            </div>
                            {review.title && (
                              <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {review.content}
                        </p>
                        <Button size="sm" variant="outline">
                          Respond
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>
                  Showcase your ice cream shop with beautiful photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Photos</h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your photos here, or click to browse
                  </p>
                  <Button>Choose Files</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Views</span>
                    <span className="font-medium">{stats.monthlyViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-medium">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-medium">{stats.averageRating.toFixed(1)}/5</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShopDashboard;