import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Coupons from "./pages/Coupons";
import CouponDetail from "./pages/CouponDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SubmitShop from "./pages/SubmitShop";
import AdminDashboard from "./pages/AdminDashboard";
import ShopDashboard from "./pages/ShopDashboard";
import UserDashboard from "./pages/UserDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shops" element={<Shops />} />
                <Route path="/shops/:id" element={<ShopDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/coupons/:id" element={<CouponDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/submit-shop" element={<SubmitShop />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/shop-dashboard" element={<ShopDashboard />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;