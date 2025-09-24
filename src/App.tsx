import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shops from "./pages/Shops";
import ShopDetail from "./pages/ShopDetail";
import Auth from "./pages/Auth";
import Events from "./pages/Events";
import Coupons from "./pages/Coupons";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SubmitShop from "./pages/SubmitShop";
import AdminDashboard from "./pages/AdminDashboard";
import ShopDashboard from "./pages/ShopDashboard";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/shop/:id" element={<ShopDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/submit-shop" element={<SubmitShop />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/shop-dashboard" element={<ShopDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
