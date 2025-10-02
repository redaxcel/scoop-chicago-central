import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus, Save, Trash } from "lucide-react";

interface EventRow {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  end_date?: string | null;
  is_featured?: boolean | null;
  location?: string | null;
  image_url?: string | null;
  gallery_images?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
}

export const EventsManager = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventRow>>({ title: "", event_date: "" });
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
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
      description: newEvent.description || null,
      event_date: newEvent.event_date,
      end_date: newEvent.end_date || null,
      is_featured: newEvent.is_featured ?? false,
      location: newEvent.location || null,
      image_url: newEvent.image_url || null,
      gallery_images: newEvent.gallery_images || null,
      seo_title: newEvent.seo_title || null,
      seo_description: newEvent.seo_description || null,
      seo_keywords: newEvent.seo_keywords || null,
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

  const updateEvent = async () => {
    if (!editingEvent || !newEvent.title || !newEvent.event_date) {
      toast({ title: "Missing info", description: "Title and date are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("events").update({
      title: newEvent.title,
      description: newEvent.description || null,
      event_date: newEvent.event_date,
      end_date: newEvent.end_date || null,
      is_featured: newEvent.is_featured ?? false,
      location: newEvent.location || null,
      image_url: newEvent.image_url || null,
      gallery_images: newEvent.gallery_images || null,
      seo_title: newEvent.seo_title || null,
      seo_description: newEvent.seo_description || null,
      seo_keywords: newEvent.seo_keywords || null,
    }).eq("id", editingEvent.id);
    setCreating(false);
    if (error) {
      toast({ title: "Failed", description: "Could not update event", variant: "destructive" });
    } else {
      toast({ title: "Event updated" });
      setNewEvent({ title: "", event_date: "" });
      setEditingEvent(null);
      refresh();
    }
  };

  const handleEdit = (event: EventRow) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      event_date: event.event_date,
      end_date: event.end_date,
      is_featured: event.is_featured,
      location: event.location,
      image_url: event.image_url,
      gallery_images: event.gallery_images,
      seo_title: event.seo_title,
      seo_description: event.seo_description,
      seo_keywords: event.seo_keywords,
    });
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setNewEvent({ title: "", event_date: "" });
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
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" /> {editingEvent ? "Edit Event" : "Create New Event"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={newEvent.title || ''} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="datetime-local" value={newEvent.event_date || ''} onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={newEvent.location || ''} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="123 Main St, Chicago, IL" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              value={newEvent.description || ''} 
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} 
              placeholder="Event description..."
              rows={3}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Main Image URL</Label>
              <Input value={newEvent.image_url || ''} onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Gallery Images (comma-separated URLs)</Label>
              <Input 
                value={newEvent.gallery_images?.join(', ') || ''} 
                onChange={(e) => setNewEvent({ ...newEvent, gallery_images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                placeholder="https://..., https://..."
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm">SEO Settings</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input value={newEvent.seo_title || ''} onChange={(e) => setNewEvent({ ...newEvent, seo_title: e.target.value })} placeholder="Custom page title" />
              </div>
              <div className="space-y-2">
                <Label>SEO Keywords</Label>
                <Input value={newEvent.seo_keywords || ''} onChange={(e) => setNewEvent({ ...newEvent, seo_keywords: e.target.value })} placeholder="ice cream, event, chicago" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea 
                value={newEvent.seo_description || ''} 
                onChange={(e) => setNewEvent({ ...newEvent, seo_description: e.target.value })} 
                placeholder="Meta description for search engines..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={editingEvent ? updateEvent : createEvent} disabled={creating}>
              <Save className="h-4 w-4 mr-1"/> {creating ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
            {editingEvent && (
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(e)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteEvent(e.id)}>
                      <Trash className="h-4 w-4 mr-1"/> Delete
                    </Button>
                  </div>
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
