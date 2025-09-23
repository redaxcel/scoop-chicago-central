import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Clock, Star, ExternalLink, Globe, Facebook, Instagram, Twitter, Calendar, Users, Car, Wifi, CreditCard } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { IceCreamMap } from "@/components/IceCreamMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone?: string;
  pricing?: "$" | "$$" | "$$$" | "$$$$";
  image_url?: string;
  website_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  amenities?: string[];
  hours?: any;
  latitude?: number;
  longitude?: number;
  gallery_images?: string[];
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
  };
}

const ShopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchShop();
      fetchReviews();
    }
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchShop = async () => {
    try {
      const { data, error } = await supabase
        .from('ice_cream_shops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setShop(data);
    } catch (error) {
      console.error('Error fetching shop:', error);
      toast({
        title: "Error",
        description: "Failed to load shop details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            display_name
          )
        `)
        .eq('shop_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to leave a review",
        variant: "destructive"
      });
      return;
    }

    if (!newReview.content.trim()) {
      toast({
        title: "Review Required",
        description: "Please write a review",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          shop_id: id,
          user_id: user.id,
          rating: newReview.rating,
          title: newReview.title || null,
          content: newReview.content
        });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!"
      });

      setNewReview({ rating: 5, title: '', content: '' });
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'parking': return Car;
      case 'wifi': return Wifi;
      case 'cards_accepted': return CreditCard;
      case 'outdoor_seating': return Users;
      default: return Calendar;
    }
  };

  const getPricingDescription = (pricing?: string) => {
    switch (pricing) {
      case "$": return "Budget Friendly";
      case "$$": return "Moderate";
      case "$$$": return "Premium";
      case "$$$$": return "Luxury";
      default: return "Price not available";
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Not Found</h1>
          <p className="text-muted-foreground mb-6">The ice cream shop you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/shops">Browse All Shops</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="relative">
        {shop.image_url ? (
          <div className="h-64 md:h-80 relative">
            <img
              src={shop.image_url}
              alt={shop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gradient-hero"></div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="container mx-auto">
            <div className="text-white">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{shop.name}</h1>
                {shop.pricing && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {shop.pricing} • {getPricingDescription(shop.pricing)}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'No reviews'}
                  </span>
                  <span>({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{shop.address}, {shop.city}, {shop.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About {shop.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {shop.description || "A delightful ice cream shop serving the finest frozen treats in Chicago."}
                </p>
              </CardContent>
            </Card>

            {/* Map */}
            {shop.latitude && shop.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <IceCreamMap
                    shops={[shop]}
                    selectedShopId={shop.id}
                    height="300px"
                    zoom={15}
                    center={[shop.latitude, shop.longitude]}
                  />
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Write Review */}
                {user ? (
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold">Write a Review</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="transition-colors"
                        >
                          <Star 
                            className={`h-5 w-5 ${
                              star <= newReview.rating 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Review title (optional)"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <Textarea
                      placeholder="Share your experience..."
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                      rows={4}
                    />
                    <Button onClick={submitReview}>Submit Review</Button>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground mb-4">Please login to leave a review</p>
                    <Button asChild>
                      <Link to="/auth">Login</Link>
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.profiles?.display_name || 'Anonymous'}</span>
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
                              <h5 className="font-medium text-sm">{review.title}</h5>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {shop.address}<br />
                        {shop.city}, {shop.state} {shop.zip_code}
                      </p>
                    </div>
                  </div>

                  {shop.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{shop.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      {shop.hours ? (
                        <div className="text-sm text-muted-foreground space-y-1">
                          {Object.entries(shop.hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between">
                              <span className="capitalize">{day}:</span>
                              <span>{hours as string}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Call for hours</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div className="flex gap-2">
                  {shop.website_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={shop.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {shop.facebook_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={shop.facebook_url} target="_blank" rel="noopener noreferrer">
                        <Facebook className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {shop.instagram_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {shop.twitter_url && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={shop.twitter_url} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {shop.amenities && shop.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {shop.amenities.map((amenity) => {
                      const IconComponent = getAmenityIcon(amenity);
                      return (
                        <div key={amenity} className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="text-sm capitalize">
                            {amenity.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {shop.gallery_images && shop.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {shop.gallery_images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${shop.name} gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;