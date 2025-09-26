import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, ExternalLink, Clock, Users, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location?: string;
  registration_url?: string;
  image_url?: string;
  is_featured: boolean;
  shop_id?: string;
  ice_cream_shops?: {
    name: string;
    city: string;
    state: string;
  };
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          ice_cream_shops (
            name,
            city,
            state
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to load event details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
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
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/events">Browse All Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  const eventStartDate = new Date(event.event_date);
  const eventEndDate = event.end_date ? new Date(event.end_date) : null;
  const isUpcoming = eventStartDate > new Date();
  const isPast = eventStartDate < new Date() && (!eventEndDate || eventEndDate < new Date());

  return (
    <>
      <Helmet>
        <title>{event.title} - Ice Cream Chicago Events</title>
        <meta name="description" content={event.description || `Join us for ${event.title} in Chicago. ${event.location ? `Located at ${event.location}.` : ''}`} />
        <meta name="keywords" content={`ice cream, chicago, events, ${event.title}, ${event.ice_cream_shops?.name || ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${event.title} - Ice Cream Chicago Events`} />
        <meta property="og:description" content={event.description || `Join us for ${event.title} in Chicago.`} />
        <meta property="og:type" content="event" />
        <meta property="og:url" content={window.location.href} />
        {event.image_url && <meta property="og:image" content={event.image_url} />}
        
        {/* Event specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": event.description,
            "startDate": event.event_date,
            "endDate": event.end_date || event.event_date,
            "location": {
              "@type": "Place",
              "name": event.location || (event.ice_cream_shops ? `${event.ice_cream_shops.name}` : "Chicago"),
              "address": event.location || `${event.ice_cream_shops?.city || 'Chicago'}, ${event.ice_cream_shops?.state || 'IL'}`
            },
            "organizer": {
              "@type": "Organization",
              "name": event.ice_cream_shops?.name || "Ice Cream Chicago"
            },
            "image": event.image_url,
            "url": window.location.href
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Header */}
        <section className="relative">
          {event.image_url ? (
            <div className="h-64 md:h-80 relative">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ) : (
            <div className="h-64 md:h-80 ice-cream-gradient"></div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="container mx-auto">
              <div className="text-white">
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to="/events">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Events
                    </Link>
                  </Button>
                  {event.is_featured && (
                    <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                  )}
                  <Badge variant={isUpcoming ? "default" : isPast ? "secondary" : "outline"}>
                    {isUpcoming ? "Upcoming" : isPast ? "Past Event" : "In Progress"}
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDateShort(event.event_date)}</span>
                    {event.end_date && event.end_date !== event.event_date && (
                      <span> - {formatDateShort(event.end_date)}</span>
                    )}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.ice_cream_shops && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Hosted by {event.ice_cream_shops.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {event.description ? (
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        Join us for an exciting ice cream event in Chicago! More details to be announced.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Registration */}
              {event.registration_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>Registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Ready to join this sweet event? Register now to secure your spot!
                    </p>
                    <Button asChild size="lg" className="w-full md:w-auto">
                      <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                        Register Now
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.event_date)}
                      </p>
                      {event.end_date && event.end_date !== event.event_date && (
                        <p className="text-sm text-muted-foreground">
                          Ends: {formatDate(event.end_date)}
                        </p>
                      )}
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.ice_cream_shops && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Hosted By</p>
                        <p className="text-sm text-muted-foreground">
                          {event.ice_cream_shops.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.ice_cream_shops.city}, {event.ice_cream_shops.state}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Related Events */}
              <Card>
                <CardHeader>
                  <CardTitle>More Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-4">
                      Check out other exciting ice cream events in Chicago!
                    </p>
                    <Button variant="outline" asChild>
                      <Link to="/events">Browse All Events</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;