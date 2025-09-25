import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus, Save, Trash } from "lucide-react";

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  end_date?: string | null;
  is_featured?: boolean | null;
  location?: string | null;
}

export const EventsManager = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventRow>>({ title: "", event_date: "" });

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("id,title,event_date,end_date,is_featured,location")
      .order("event_date", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load events", variant: "destructive" });
    } else {
      setEvents((data as any) || []);
    }
    setLoading(false);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.event_date) {
      toast({ title: "Missing info", description: "Title and date are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("events").insert({
      title: newEvent.title,
      event_date: newEvent.event_date,
      end_date: newEvent.end_date || null,
      is_featured: newEvent.is_featured ?? false,
      location: newEvent.location || null,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Failed", description: "Could not create event", variant: "destructive" });
    } else {
      toast({ title: "Event created" });
      setNewEvent({ title: "", event_date: "" });
      refresh();
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed", description: "Could not delete event", variant: "destructive" });
    } else {
      toast({ title: "Event deleted" });
      setEvents(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Management</h3>
          <p className="text-muted-foreground">Create and manage ice cream events</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Create New Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newEvent.title || ''} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="datetime-local" value={newEvent.event_date || ''} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input value={newEvent.location || ''} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
            </div>
          </div>
          <Button onClick={createEvent} disabled={creating}>
            <Save className="h-4 w-4 mr-1"/> {creating ? 'Creating...' : 'Create Event'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events found.</div>
          ) : (
            <div className="space-y-2">
              {events.map(e => (
                <div key={e.id} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleString()} {e.location ? `• ${e.location}` : ''}</div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteEvent(e.id)}>
                    <Trash className="h-4 w-4 mr-1"/> Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsManager;
