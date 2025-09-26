import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Percent, Clock, MapPin, ExternalLink, ArrowLeft, Copy, Check } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Coupon {
  id: string;
  title: string;
  description: string;
  coupon_code?: string;
  discount_percent?: number;
  discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  current_usage: number;
  terms_conditions?: string;
  is_active: boolean;
  shop_id: string;
  ice_cream_shops?: {
    name: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
    website_url?: string;
    image_url?: string;
  };
}

const CouponDetail = () => {
  const { id } = useParams<{ id: string }>();
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
        .from('coupons')
        .select(`
          *,
          ice_cream_shops (
            name,
            address,
            city,
            state,
            phone,
            website_url,
            image_url
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .single();

      if (error) throw error;
      setCoupon(data);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      toast({
        title: "Error",
        description: "Failed to load coupon details or coupon has expired",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Coupon code copied to clipboard"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy coupon code",
        variant: "destructive"
      });
    }
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discount_percent) {
      return `${coupon.discount_percent}% OFF`;
    } else if (coupon.discount_amount) {
      return `$${coupon.discount_amount} OFF`;
    }
    return "Special Discount";
  };

  const isExpiring = (dateString: string) => {
    const expireDate = new Date(dateString);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7;
  };

  const isLimitedUse = (coupon: Coupon) => {
    return coupon.usage_limit && coupon.current_usage >= coupon.usage_limit * 0.8;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
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
          <p className="text-muted-foreground mb-6">The coupon you're looking for doesn't exist or has expired.</p>
          <Button asChild>
            <Link to="/coupons">Browse All Coupons</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{coupon.title} - {getDiscountText(coupon)} at {coupon.ice_cream_shops?.name} | Ice Cream Chicago</title>
        <meta name="description" content={`${coupon.description} Get ${getDiscountText(coupon)} at ${coupon.ice_cream_shops?.name}. Valid until ${formatDate(coupon.valid_until)}.`} />
        <meta name="keywords" content={`ice cream, chicago, coupon, discount, ${coupon.ice_cream_shops?.name}, ${coupon.title}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${coupon.title} - ${getDiscountText(coupon)} at ${coupon.ice_cream_shops?.name}`} />
        <meta property="og:description" content={`${coupon.description} Valid until ${formatDate(coupon.valid_until)}.`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {coupon.ice_cream_shops?.image_url && <meta property="og:image" content={coupon.ice_cream_shops.image_url} />}
        
        {/* Coupon structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Offer",
            "name": coupon.title,
            "description": coupon.description,
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": coupon.discount_amount || 0,
              "priceCurrency": "USD"
            },
            "validFrom": coupon.valid_from,
            "validThrough": coupon.valid_until,
            "seller": {
              "@type": "LocalBusiness",
              "name": coupon.ice_cream_shops?.name,
              "address": `${coupon.ice_cream_shops?.address}, ${coupon.ice_cream_shops?.city}, ${coupon.ice_cream_shops?.state}`
            },
            "url": window.location.href
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Header */}
        <section className="relative">
          {coupon.ice_cream_shops?.image_url ? (
            <div className="h-64 md:h-80 relative">
              <img
                src={coupon.ice_cream_shops.image_url}
                alt={coupon.ice_cream_shops.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ) : (
            <div className="h-64 md:h-80 ice-cream-gradient"></div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="container mx-auto">
              <div className="text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/coupons">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Coupons
                    </Link>
                  </Button>
                  {isExpiring(coupon.valid_until) && (
                    <Badge variant="destructive">Expires Soon!</Badge>
                  )}
                  {isLimitedUse(coupon) && (
                    <Badge className="bg-orange-500">Limited Uses</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-accent text-accent-foreground text-2xl font-bold px-4 py-2 rounded-lg">
                    {getDiscountText(coupon)}
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{coupon.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{coupon.ice_cream_shops?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Valid until {formatDate(coupon.valid_until)}</span>
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
              {/* Coupon Code */}
              {coupon.coupon_code && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5" />
                      Coupon Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border-2 border-dashed border-primary/30">
                      <code className="text-2xl font-bold text-primary flex-1">
                        {coupon.coupon_code}
                      </code>
                      <Button 
                        onClick={() => copyToClipboard(coupon.coupon_code!)}
                        variant="outline"
                        size="sm"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Present this code at checkout to receive your discount
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Deal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {coupon.description}
                  </p>
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              {coupon.terms_conditions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                        {coupon.terms_conditions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Shop Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Shop Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{coupon.ice_cream_shops?.name}</h4>
                    <p className="text-muted-foreground text-sm">
                      {coupon.ice_cream_shops?.address}<br />
                      {coupon.ice_cream_shops?.city}, {coupon.ice_cream_shops?.state}
                    </p>
                  </div>

                  {coupon.ice_cream_shops?.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="text-sm text-muted-foreground">
                        {coupon.ice_cream_shops.phone}
                      </span>
                    </div>
                  )}

                  {coupon.ice_cream_shops?.website_url && (
                    <Button variant="outline" asChild className="w-full">
                      <a href={coupon.ice_cream_shops.website_url} target="_blank" rel="noopener noreferrer">
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Validity & Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Validity & Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valid From:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(coupon.valid_from)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Valid Until:</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(coupon.valid_until)}
                    </span>
                  </div>

                  {coupon.usage_limit && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uses Left:</span>
                      <span className="text-sm text-muted-foreground">
                        {coupon.usage_limit - coupon.current_usage} / {coupon.usage_limit}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* More Coupons */}
              <Card>
                <CardHeader>
                  <CardTitle>More Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-4">
                      Check out other amazing deals and discounts!
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/coupons">Browse All Coupons</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponDetail;