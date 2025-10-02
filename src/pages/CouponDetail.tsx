import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Percent, Calendar, ArrowLeft, Store, Tag, AlertCircle, MapPin } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Coupon {
  id: string;
  title: string;
  description: string;
  coupon_code?: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until: string;
  terms_conditions?: string;
  usage_limit?: number;
  current_usage: number;
  is_active: boolean;
  shop_id: string;
  image_url?: string;
  gallery_images?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  ice_cream_shops?: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

const CouponDetail = () => {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select(`
          *,
          ice_cream_shops (
            name,
            address,
            city,
            state
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setCoupon(data);
    } catch (error) {
      console.error("Error fetching coupon:", error);
      toast({
        title: "Error",
        description: "Failed to load coupon details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (coupon?.coupon_code) {
      navigator.clipboard.writeText(coupon.coupon_code);
      setCopied(true);
      toast({
        title: "Code Copied!",
        description: "Coupon code copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = coupon && new Date(coupon.valid_until) < new Date();
  const isLimitReached = coupon && coupon.usage_limit && coupon.current_usage >= coupon.usage_limit;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Coupon Not Found</h1>
          <Button asChild>
            <Link to="/coupons">Back to Coupons</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{coupon.seo_title || `${coupon.title} | Ice Cream Chicago Coupons`}</title>
        <meta name="description" content={coupon.seo_description || coupon.description} />
        <meta name="keywords" content={coupon.seo_keywords || "ice cream coupon, discount, chicago"} />
        <meta property="og:title" content={coupon.seo_title || coupon.title} />
        <meta property="og:description" content={coupon.seo_description || coupon.description} />
        {coupon.image_url && <meta property="og:image" content={coupon.image_url} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/coupons">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Coupons
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{coupon.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Store className="h-4 w-4" />
                        <Link
                          to={`/shops/${coupon.shop_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {coupon.ice_cream_shops?.name}
                        </Link>
                      </div>
                    </div>
                    <div className="text-right">
                      {coupon.discount_percent && (
                        <div className="text-4xl font-bold text-primary">
                          {coupon.discount_percent}% OFF
                        </div>
                      )}
                      {coupon.discount_amount && (
                        <div className="text-4xl font-bold text-primary">
                          ${coupon.discount_amount} OFF
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg">{coupon.description}</p>

                  {(isExpired || isLimitReached || !coupon.is_active) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {isExpired && "This coupon has expired."}
                        {isLimitReached && "This coupon has reached its usage limit."}
                        {!coupon.is_active && "This coupon is currently inactive."}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Valid From</div>
                        <div className="font-medium">
                          {new Date(coupon.valid_from).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Valid Until</div>
                        <div className="font-medium">
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {coupon.terms_conditions && (
                    <div>
                      <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {coupon.terms_conditions}
                      </p>
                    </div>
                  )}

                  {coupon.usage_limit && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {coupon.usage_limit - coupon.current_usage} uses remaining
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {coupon.ice_cream_shops && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shop Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium">{coupon.ice_cream_shops.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {coupon.ice_cream_shops.address}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {coupon.ice_cream_shops.city}, {coupon.ice_cream_shops.state}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Coupon Code
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {coupon.coupon_code ? (
                    <>
                      <div className="bg-gradient-hero p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-white tracking-wider">
                          {coupon.coupon_code}
                        </div>
                      </div>
                      <Button
                        onClick={handleCopyCode}
                        className="w-full"
                        disabled={isExpired || isLimitReached || !coupon.is_active}
                      >
                        {copied ? "Copied!" : "Copy Code"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      No code required - automatically applied at checkout
                    </div>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    disabled={isExpired || isLimitReached || !coupon.is_active}
                  >
                    <Link to={`/shops/${coupon.shop_id}`}>
                      Visit Shop
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CouponDetail;
