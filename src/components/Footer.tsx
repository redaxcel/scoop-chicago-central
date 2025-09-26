import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-primary/5 to-accent/5 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold hero-text">Ice Cream Chicago</h3>
            <p className="text-muted-foreground">
              Chicago's premier directory for the finest ice cream shops in the Windy City.
              Discover your next favorite scoop!
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-accent hover:text-accent-foreground transition-all">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-secondary hover:text-secondary-foreground transition-all">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/shops" className="block text-muted-foreground hover:text-primary transition-colors">
                Browse Shops
              </Link>
              <Link to="/events" className="block text-muted-foreground hover:text-primary transition-colors">
                Upcoming Events
              </Link>
              <Link to="/coupons" className="block text-muted-foreground hover:text-primary transition-colors">
                Deals & Coupons
              </Link>
              <Link to="/submit-shop" className="block text-muted-foreground hover:text-primary transition-colors">
                List Your Shop
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Support</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">
              Get the latest updates on new shops and sweet deals!
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-muted border-border"
              />
              <Button className="w-full bg-primary hover:bg-primary/90">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Chicago, Illinois</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="h-5 w-5 text-accent" />
              <span className="text-muted-foreground">(312) 555-SCOOP</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="h-5 w-5 text-secondary" />
              <span className="text-muted-foreground">hello@icecreamchicago.com</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Ice Cream Chicago. All rights reserved. Made with ❤️ for ice cream lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;