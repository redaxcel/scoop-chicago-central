import { useState, useEffect } from "react";
import { Search, MapPin, Star, Calendar, Percent } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { ShopCard } from "@/components/ShopCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-ice-cream.jpg";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  pricing: "$" | "$$" | "$$$" | "$$$$";
  image_url?: string;
  website_url?: string;
  amenities: string[];
  hours: any; // Using any for JSON compatibility
}

const Index = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedShops();
  }, []);

  const fetchFeaturedShops = async () => {
    try {
      const { data, error } = await supabase
        .from('ice_cream_shops')
        .select('*')
        .eq('status', 'active')
        .limit(6);

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Navigate to shops page with search query
    window.location.href = `/shops?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                Chicago's Premier
                <span className="block text-ice-cream-vanilla">Ice Cream Directory</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Discover the sweetest scoops in the Windy City. From artisanal gelato to classic soft-serve, 
                find your perfect frozen treat across Chicago.
              </p>
              
              {/* Search Bar */}
              <div className="flex gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search ice cream shops, flavors, or neighborhoods..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-6 text-lg bg-white/95 border-none shadow-warm"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button 
                  size="lg" 
                  onClick={handleSearch}
                  className="px-8 py-6 text-lg shadow-warm hover:shadow-pink transition-all duration-300"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Find Shops
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/events">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Events
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild>
                  <Link to="/coupons">
                    <Percent className="h-5 w-5 mr-2" />
                    Hot Deals
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
              <img
                src={heroImage}
                alt="Delicious ice cream scoops"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-warm animate-gentle-float"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: MapPin, number: "50+", label: "Ice Cream Shops" },
              { icon: Star, number: "4.8", label: "Average Rating" },
              { icon: Calendar, number: "25+", label: "Monthly Events" },
              { icon: Percent, number: "100+", label: "Active Deals" }
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${1 + index * 0.1}s` }}>
                <div className="bg-white p-6 rounded-2xl shadow-mint bounce-hover">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                  <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Ice Cream Shops</h2>
            <p className="text-xl text-muted-foreground">
              Handpicked favorites that Chicago locals can't stop talking about
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {shops.slice(0, 3).map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Listings */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">New Listings</h2>
            <p className="text-xl text-muted-foreground">
              Fresh scoops just added to our directory
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.slice(1, 4).map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        </div>
      </section>

      {/* Highly Rated */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Highly Rated</h2>
            <p className="text-xl text-muted-foreground">
              Top-rated shops loved by ice cream enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shops.slice(2, 5).map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/shops">
                View All Ice Cream Shops
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Own an Ice Cream Shop in Chicago?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join Chicago's premier ice cream directory and connect with thousands of ice cream lovers 
            searching for their next favorite scoop.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/submit-shop">List Your Shop</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
