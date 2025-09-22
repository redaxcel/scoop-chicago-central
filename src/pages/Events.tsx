import { useState, useEffect } from "react";
import { Calendar, MapPin, ExternalLink, Users } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="bg-gradient-card py-16 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Ice Cream Events</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join fellow ice cream enthusiasts at festivals, tastings, and special events 
            happening across Chicago
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📅</div>
              <h2 className="text-3xl font-bold mb-4">No Upcoming Events</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Stay tuned! We're always planning new ice cream events and festivals. 
                Check back soon or follow us for updates.
              </p>
              <Button asChild>
                <a href="mailto:events@icecreamchicago.com">Suggest an Event</a>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <Card key={event.id} className="group hover:shadow-warm transition-all duration-300 bounce-hover overflow-hidden">
                  <div className="relative">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-hero flex items-center justify-center">
                        <Calendar className="h-16 w-16 text-white" />
                      </div>
                    )}
                    {event.is_featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{format(new Date(event.event_date), 'PPP')}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    {event.registration_url && (
                      <Button asChild className="w-full">
                        <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Register Now
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Host an Ice Cream Event?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            We'd love to feature your ice cream event! Whether it's a tasting, festival, 
            or special promotion, let Chicago know about it.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="mailto:events@icecreamchicago.com">Submit Your Event</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Events;