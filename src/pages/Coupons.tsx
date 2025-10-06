import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Percent, Calendar, Copy, ExternalLink } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount_percent?: number;
  discount_amount?: number;
  coupon_code?: string;
  terms_conditions?: string;
  valid_until: string;
  shop?: {
    name: string;
    id: string;
  };
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select(`
          *,
          ice_cream_shops!inner (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        shop: {
          name: item.ice_cream_shops.name,
          id: item.ice_cream_shops.id
        }
      }));
      
      setCoupons(transformedData);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: `Coupon code "${code}" has been copied to your clipboard.`,
    });
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_percent) {
      return `${coupon.discount_percent}% OFF`;
    }
    if (coupon.discount_amount) {
      return `$${coupon.discount_amount} OFF`;
    }
    return "SPECIAL OFFER";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-card py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sweet Deals & Coupons</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Save money while satisfying your sweet tooth! Discover the latest deals 
            and discounts from Chicago's best ice cream shops.
          </p>
        </div>
      </section>

      {/* Coupons Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎟️</div>
              <h2 className="text-3xl font-bold mb-4">No Active Deals</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Check back soon! Ice cream shops are always adding new deals and special offers. 
                Follow us to be the first to know about sweet savings.
              </p>
              <Button asChild>
                <a href="mailto:deals@icecreamchicago.com">Partner With Us</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coupons.map((coupon) => (
                <Card key={coupon.id} className="group hover:shadow-warm transition-all duration-300 bounce-hover overflow-hidden relative">
                  {/* Discount Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-lg scoop-border">
                      {getDiscountDisplay(coupon)}
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors mb-2">
                          {coupon.title}
                        </CardTitle>
                        {coupon.shop && (
                          <Badge variant="secondary" className="mb-2">
                            {coupon.shop.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {coupon.description}
                    </p>

                    {/* Coupon Code */}
                    {coupon.coupon_code && (
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">Coupon Code</p>
                            <p className="text-lg font-bold font-mono">{coupon.coupon_code}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyCode(coupon.coupon_code!)}
                            className="flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Expiry Date */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Valid until {format(new Date(coupon.valid_until), 'PPP')}</span>
                    </div>

                    {/* Terms */}
                    {coupon.terms_conditions && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Terms & Conditions:</p>
                        <p>{coupon.terms_conditions}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button asChild className="flex-1">
                        <Link to={`/coupons/${coupon.id}`}>View Details</Link>
                      </Button>
                      {coupon.shop && (
                        <Button variant="outline" size="icon" asChild>
                          <Link to={`/shops/${coupon.shop.id}`}>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss a Sweet Deal</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get notified about the latest ice cream deals, exclusive coupons, and special promotions 
            from your favorite Chicago ice cream shops.
          </p>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Coupons;