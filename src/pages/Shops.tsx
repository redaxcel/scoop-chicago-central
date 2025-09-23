import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Star } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { ShopCard } from "@/components/ShopCard";
import { IceCreamMap } from "@/components/IceCreamMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceFilter, setPriceFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShops();
    
    // Check for search query in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  useEffect(() => {
    filterAndSortShops();
  }, [shops, searchQuery, sortBy, priceFilter]);

  const fetchShops = async () => {
    try {
      const { data, error } = await supabase
        .from('ice_cream_shops')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortShops = () => {
    let filtered = [...shops];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.amenities?.some(amenity => 
          amenity.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply price filter
    if (priceFilter) {
      filtered = filtered.filter(shop => shop.pricing === priceFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price_low':
        filtered.sort((a, b) => {
          const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
          return (priceOrder[a.pricing || '$'] || 1) - (priceOrder[b.pricing || '$'] || 1);
        });
        break;
      case 'price_high':
        filtered.sort((a, b) => {
          const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
          return (priceOrder[b.pricing || '$'] || 1) - (priceOrder[a.pricing || '$'] || 1);
        });
        break;
      default:
        break;
    }

    setFilteredShops(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceFilter("");
    setSortBy("name");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-card py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Chicago Ice Cream Shops</h1>
            <p className="text-xl text-muted-foreground">
              Discover the best ice cream experiences across the Windy City
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search shops, neighborhoods, flavors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
              
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="$">$ - Budget Friendly</SelectItem>
                  <SelectItem value="$$">$$ - Moderate</SelectItem>
                  <SelectItem value="$$$">$$$ - Premium</SelectItem>
                  <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(searchQuery || priceFilter) && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                  </Badge>
                )}
                {priceFilter && (
                  <Badge variant="secondary">
                    Price: {priceFilter}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">
              {filteredShops.length} Shop{filteredShops.length !== 1 ? 's' : ''} Found
            </h2>
            <Button variant="outline" asChild>
              <a href="#map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                View Map
              </a>
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍦</div>
              <h3 className="text-2xl font-semibold mb-4">No shops found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search criteria or browse all shops.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Shop Locations</h2>
            <p className="text-muted-foreground">
              Find ice cream shops near you with our interactive map
            </p>
          </div>
          <div className="h-96">
            <IceCreamMap 
              shops={filteredShops} 
              onShopSelect={(shopId) => window.location.href = `/shop/${shopId}`}
              height="400px"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shops;