import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import iceCreamScoop from "@/assets/ice-cream-scoop.jpg";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Ice Cream Shops", href: "/shops" },
    { name: "Events", href: "/events" },
    { name: "Coupons", href: "/coupons" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>(312) ICE-CREAM</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>hello@icecreamchicago.com</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Chicago, IL</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-background border-b-2 border-primary/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={iceCreamScoop} 
                  alt="Ice Cream Scoop" 
                  className="w-12 h-12 scoop-border animate-gentle-float"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold hero-text">Ice Cream Chicago</h1>
                <p className="text-sm text-muted-foreground">Best Scoops in the Windy City</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-full transition-all duration-300 font-medium ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-pink"
                      : "hover:bg-secondary hover:text-secondary-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/submit-shop">Submit Shop</Link>
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card border-t">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t">
                  <Button variant="outline" asChild>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/submit-shop" onClick={() => setIsOpen(false)}>Submit Shop</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};