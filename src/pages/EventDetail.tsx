import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Calendar, MapPin, Clock, ArrowLeft, UserPlus } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { IceCreamMap } from "@/components/IceCreamMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location: string;
  image_url?: string;
  registration_url?: string;
  is_featured: boolean;
  gallery_images?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  latitude?: number;
  longitude?: number;
}

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    if (id) {
      fetchEvent();
      fetchRegistrationCount();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationCount = async () => {
    try {
      const { count, error } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", id);

      if (error) throw error;
      setRegistrationCount(count || 0);
    } catch (error) {
      console.error("Error fetching registration count:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setRegistering(true);
    try {
      const { error: dbError } = await supabase
        .from("event_registrations")
        .insert({
          event_id: event.id,
          name,
          email,
          user_id: currentUser?.id || null,
        });

      if (dbError) throw dbError;

      const { error: emailError } = await supabase.functions.invoke(
        "send-event-registration",
        {
          body: {
            name,
            email,
            event_title: event.title,
            event_date: event.event_date,
            event_location: event.location,
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
      }

      toast({
        title: "Registration Successful!",
        description: "Check your email for confirmation details.",
      });

      setName("");
      setEmail("");
      fetchRegistrationCount();
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{event.seo_title || `${event.title} | Ice Cream Chicago Events`}</title>
        <meta name="description" content={event.seo_description || event.description || `Join us for ${event.title} in Chicago`} />
        <meta name="keywords" content={event.seo_keywords || "ice cream event, chicago, ice cream"} />
        <meta property="og:title" content={event.seo_title || event.title} />
        <meta property="og:description" content={event.seo_description || event.description || ""} />
        {event.image_url && <meta property="og:image" content={event.image_url} />}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/events">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-96 object-cover rounded-2xl shadow-warm"
                />
              )}

              <div>
                <h1 className="text-4xl font-bold mb-4">{event.title}</h1>

                <div className="flex flex-wrap gap-4 text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>
                      {new Date(event.event_date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>
                      {new Date(event.event_date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  {registrationCount > 0 && (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <span>{registrationCount} {registrationCount === 1 ? 'person' : 'people'} registered</span>
                    </div>
                  )}
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="text-lg">{event.description}</p>
                </div>
              </div>

              {event.latitude && event.longitude && (
                <Card>
                  <CardHeader>
                    <CardTitle>Event Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IceCreamMap
                      shops={[{
                        id: event.id,
                        name: event.title,
                        latitude: event.latitude,
                        longitude: event.longitude,
                        address: event.location,
                        city: '',
                        state: '',
                        description: event.description
                      } as any]}
                      selectedShopId={event.id}
                      height="300px"
                      zoom={15}
                      center={[event.latitude, event.longitude]}
                    />
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Register for Event
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={registering}
                    >
                      {registering ? "Registering..." : "Register Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default EventDetail;
