import { useState, useEffect } from "react";
import { Mail, Calendar, Users, Download, Search, Trash2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventRegistration {
  id: string;
  name: string;
  email: string;
  created_at: string;
  event_id: string;
  events: {
    title: string;
    event_date: string;
    location: string;
  };
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
}

export const EventRegistrationsManager = () => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [selectedEventForEmail, setSelectedEventForEmail] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title, event_date, location")
        .order("event_date", { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Fetch all registrations with event details
      const { data: registrationsData, error: registrationsError } = await supabase
        .from("event_registrations")
        .select(`
          *,
          events (
            title,
            event_date,
            location
          )
        `)
        .order("created_at", { ascending: false });

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load event registrations.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesEvent = selectedEvent === "all" || reg.event_id === selectedEvent;
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.events.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Event", "Event Date", "Registration Date"];
    const rows = filteredRegistrations.map((reg) => [
      reg.name,
      reg.email,
      reg.events.title,
      new Date(reg.events.event_date).toLocaleDateString(),
      new Date(reg.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-registrations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Registrations exported to CSV.",
    });
  };

  const handleSendEmailMarketing = async () => {
    if (!selectedEventForEmail || !emailSubject || !emailContent) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmail(true);
    try {
      // Get recipients for the selected event
      const recipients = registrations
        .filter((reg) => reg.event_id === selectedEventForEmail)
        .map((reg) => ({ name: reg.name, email: reg.email }));

      if (recipients.length === 0) {
        toast({
          title: "No Recipients",
          description: "No registrations found for this event.",
          variant: "destructive",
        });
        return;
      }

      // Call the edge function to send emails
      const { error } = await supabase.functions.invoke("send-event-marketing", {
        body: {
          recipients,
          subject: emailSubject,
          content: emailContent,
          event_id: selectedEventForEmail,
        },
      });

      if (error) throw error;

      toast({
        title: "Emails Sent",
        description: `Marketing email sent to ${recipients.length} registrants.`,
      });

      setEmailSubject("");
      setEmailContent("");
      setSelectedEventForEmail("");
    } catch (error: any) {
      console.error("Error sending emails:", error);
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send marketing emails.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteRegistration = async (id: string) => {
    try {
      const { error } = await supabase
        .from("event_registrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRegistrations(registrations.filter((reg) => reg.id !== id));
      toast({
        title: "Registration Deleted",
        description: "Registration has been removed.",
      });
    } catch (error) {
      console.error("Error deleting registration:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete registration.",
        variant: "destructive",
      });
    }
  };

  const getRegistrationCount = (eventId: string) => {
    return registrations.filter((reg) => reg.event_id === eventId).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">Loading registrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrations.length}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Events with registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredRegistrations.length}</div>
            <p className="text-xs text-muted-foreground">Current view</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Event Registrations</CardTitle>
              <CardDescription>
                Manage and communicate with event registrants
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Marketing Email</DialogTitle>
                    <DialogDescription>
                      Send an email to all registrants of a specific event
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Event</Label>
                      <Select value={selectedEventForEmail} onValueChange={setSelectedEventForEmail}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.title} ({getRegistrationCount(event.id)} registrants)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Email Subject</Label>
                      <Input
                        id="email-subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Event reminder: Don't miss out!"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-content">Email Content</Label>
                      <Textarea
                        id="email-content"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        placeholder="Dear {name}, we're excited to remind you about..."
                        rows={8}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{name}"} to personalize with registrant names
                      </p>
                    </div>

                    <Button
                      onClick={handleSendEmailMarketing}
                      disabled={sendingEmail}
                      className="w-full"
                    >
                      {sendingEmail ? "Sending..." : "Send to All Registrants"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Registrations List */}
          {filteredRegistrations.length > 0 ? (
            <div className="space-y-3">
              {filteredRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold">{registration.name}</h4>
                        <p className="text-sm text-muted-foreground">{registration.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary">
                            {registration.events.title}
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(registration.events.event_date).toLocaleDateString()}
                          </Badge>
                          <Badge variant="outline">
                            Registered: {new Date(registration.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRegistration(registration.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Registrations Found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedEvent !== "all"
                  ? "Try adjusting your filters"
                  : "Event registrations will appear here"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations by Event</CardTitle>
          <CardDescription>
            Overview of registration counts for each event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => {
              const count = getRegistrationCount(event.id);
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                  <Badge variant={count > 0 ? "default" : "secondary"}>
                    {count} {count === 1 ? "registrant" : "registrants"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};