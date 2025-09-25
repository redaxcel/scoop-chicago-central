import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Star, Trash2, Flag, Check, X } from "lucide-react";

interface ReviewWithDetails {
  id: string;
  title: string;
  content: string;
  rating: number;
  created_at: string;
  user_id: string;
  shop_id: string;
  display_name?: string;
  shop_name?: string;
}

export const ReviewsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Get reviews with shop names
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (reviewsData) {
        // Get unique user and shop IDs
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const shopIds = [...new Set(reviewsData.map(r => r.shop_id))];

        // Fetch profiles and shops
        const [{ data: profiles }, { data: shops }] = await Promise.all([
          supabase.from('profiles').select('user_id, display_name').in('user_id', userIds),
          supabase.from('ice_cream_shops').select('id, name').in('id', shopIds)
        ]);

        // Combine data
        const reviewsWithDetails = reviewsData.map(review => ({
          ...review,
          display_name: profiles?.find(p => p.user_id === review.user_id)?.display_name || 'Anonymous',
          shop_name: shops?.find(s => s.id === review.shop_id)?.name || 'Unknown Shop'
        }));

        setReviews(reviewsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      toast({ title: "Failed", description: "Could not delete review", variant: "destructive" });
    } else {
      toast({ title: "Review deleted" });
      fetchReviews();
    }
  };

  const filtered = reviews.filter(r => {
    const matchesSearch = [r.title, r.content, r.display_name, r.shop_name].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesRating = ratingFilter === "all" ? true : r.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Review Management</h3>
          <p className="text-muted-foreground">Monitor and moderate customer reviews</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> All Reviews ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading reviews...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No reviews found.</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.display_name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{review.shop_name}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteReview(review.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  <p className="text-sm text-muted-foreground">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {reviews.filter(r => 
                    new Date(r.created_at).getMonth() === new Date().getMonth()
                  ).length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewsManager;