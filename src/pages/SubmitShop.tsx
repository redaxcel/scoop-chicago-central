import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Building2, Mail, Phone, Globe } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SubmitShop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: 'Chicago',
    state: 'IL',
    zip_code: '',
    website_url: '',
    description: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.business_name || !formData.contact_name || !formData.contact_email || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('shop_submissions')
        .insert({
          business_name: formData.business_name,
          contact_name: formData.contact_name,
          contact_email: formData.contact_email,
          contact_phone: formData.contact_phone || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code || null,
          website_url: formData.website_url || null,
          description: formData.description || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Submission Successful!",
        description: "Thank you for submitting your ice cream shop. We'll review it and get back to you soon!",
      });

      // Reset form
      setFormData({
        business_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: 'Chicago',
        state: 'IL',
        zip_code: '',
        website_url: '',
        description: '',
        notes: ''
      });

      // Redirect to shops page after a short delay
      setTimeout(() => {
        navigate('/shops');
      }, 2000);

    } catch (error) {
      console.error('Error submitting shop:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your shop. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-card py-12 border-b">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Building2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Submit Your Ice Cream Shop</h1>
            <p className="text-xl text-muted-foreground">
              Join the best ice cream directory in Chicago! Share your shop with ice cream lovers across the city.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>
                  Please provide accurate information about your ice cream shop. All submissions are reviewed before being published.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Business Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleInputChange}
                        placeholder="Sweet Scoops Ice Cream"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Tell us about your ice cream shop, specialties, and what makes it unique..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website_url">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="website_url"
                          name="website_url"
                          value={formData.website_url}
                          onChange={handleInputChange}
                          placeholder="https://yourshop.com"
                          className="pl-10"
                          type="url"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_name">Contact Name *</Label>
                        <Input
                          id="contact_name"
                          name="contact_name"
                          value={formData.contact_name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            id="contact_phone"
                            name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleInputChange}
                            placeholder="(312) 555-0123"
                            className="pl-10"
                            type="tel"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="contact_email"
                          name="contact_email"
                          value={formData.contact_email}
                          onChange={handleInputChange}
                          placeholder="owner@sweetscoops.com"
                          className="pl-10"
                          type="email"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="address">Street Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="123 Michigan Avenue"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Chicago"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="IL"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleInputChange}
                          placeholder="60601"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Additional Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any additional information you'd like us to know about your shop..."
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <Button 
                      type="submit" 
                      size="lg" 
                      disabled={loading}
                      className="min-w-32"
                    >
                      {loading ? "Submitting..." : "Submit Shop"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What Happens Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                    <p>We review your submission within 2-3 business days</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <p>If approved, your shop goes live on our directory</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                    <p>You'll receive login credentials to manage your listing</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listing Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <p>Increased visibility to ice cream lovers</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <p>Customer reviews and ratings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <p>Photo gallery and detailed information</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <p>Event and coupon promotion opportunities</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubmitShop;