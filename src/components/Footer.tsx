import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Ice Cream Chicago</h3>
            <p className="text-gray-300">
              Chicago's premier directory for the finest ice cream shops in the Windy City.
              Discover your next favorite scoop!
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-white hover:text-gray-900">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-white hover:text-gray-900">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="bg-transparent border-gray-600 hover:bg-white hover:text-gray-900">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/shops" className="block text-gray-300 hover:text-white transition-colors">
                Browse Shops
              </Link>
              <Link to="/events" className="block text-gray-300 hover:text-white transition-colors">
                Upcoming Events
              </Link>
              <Link to="/coupons" className="block text-gray-300 hover:text-white transition-colors">
                Deals & Coupons
              </Link>
              <Link to="/submit-shop" className="block text-gray-300 hover:text-white transition-colors">
                List Your Shop
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link to="/auth" className="block text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Stay Updated</h4>
            <p className="text-gray-300 text-sm">
              Get the latest updates on new shops and sweet deals!
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button className="w-full">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="grid md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <MapPin className="h-5 w-5 text-blue-400" />
              <span className="text-gray-300">Chicago, Illinois</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="h-5 w-5 text-green-400" />
              <span className="text-gray-300">(312) 555-SCOOP</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="h-5 w-5 text-purple-400" />
              <span className="text-gray-300">hello@icecreamchicago.com</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Ice Cream Chicago. All rights reserved. Made with ❤️ for ice cream lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;