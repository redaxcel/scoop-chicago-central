import { MapPin, Phone, Star, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface ShopCardProps {
  shop: {
    id: string;
    name: string;
    description?: string;
    address: string;
    phone?: string;
    pricing?: "$" | "$$" | "$$$" | "$$$$";
    image_url?: string;
    website_url?: string;
    amenities?: string[];
    hours?: any; // Using any for JSON compatibility
  };
  rating?: number;
  reviewCount?: number;
}

export const ShopCard = ({ shop, rating = 4.5, reviewCount = 0 }: ShopCardProps) => {
  const getPricingColor = (pricing?: string) => {
    switch (pricing) {
      case "$": return "bg-ice-cream-mint text-ice-cream-mint";
      case "$$": return "bg-ice-cream-orange text-ice-cream-orange";
      case "$$$": return "bg-ice-cream-cherry text-ice-cream-cherry";
      case "$$$$": return "bg-ice-cream-pink text-ice-cream-pink";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);
    
    if (shop.hours && shop.hours[currentDay]) {
      const [open, close] = shop.hours[currentDay].split('-');
      return currentTime >= open && currentTime <= close ? "Open" : "Closed";
    }
    return "Hours Unknown";
  };

  return (
    <Card className="group hover:shadow-warm transition-all duration-300 bounce-hover overflow-hidden">
      <div className="relative">
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-hero flex items-center justify-center">
            <div className="text-white font-bold text-lg">{shop.name.charAt(0)}</div>
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          {shop.pricing && (
            <Badge className={`${getPricingColor(shop.pricing)} font-bold`}>
              {shop.pricing}
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">({reviewCount})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {shop.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shop.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{shop.address}</span>
          </div>
          
          {shop.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span>{shop.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className={getCurrentStatus() === "Open" ? "text-green-600 font-medium" : "text-red-500"}>
              {getCurrentStatus()}
            </span>
          </div>
        </div>

        {shop.amenities && shop.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {shop.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity.replace("_", " ")}
              </Badge>
            ))}
            {shop.amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{shop.amenities.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link to={`/shop/${shop.id}`}>View Details</Link>
          </Button>
          {shop.website_url && (
            <Button variant="outline" size="icon" asChild>
              <a href={shop.website_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};