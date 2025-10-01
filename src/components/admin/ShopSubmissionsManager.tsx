import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Search, Mail, Phone, MapPin } from "lucide-react";

interface Submission {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  website_url?: string;
  description?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export const ShopSubmissionsManager = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from("shop_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load shop submissions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("shop_submissions")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setSubmissions(
        submissions.map((s) => (s.id === id ? { ...s, status } : s))
      );

      toast({
        title: "Status Updated",
        description: `Submission ${status === "approved" ? "approved" : "rejected"}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update submission status.",
        variant: "destructive",
      });
    }
  };

  const convertToShop = async (submission: Submission) => {
    try {
      const { error } = await supabase.from("ice_cream_shops").insert({
        name: submission.business_name,
        address: submission.address,
        city: submission.city,
        state: submission.state,
        zip_code: submission.zip_code,
        phone: submission.contact_phone,
        website_url: submission.website_url,
        description: submission.description,
        status: "pending",
        owner_name: submission.contact_name,
        owner_email: submission.contact_email,
      });

      if (error) throw error;

      await updateStatus(submission.id, "approved");

      toast({
        title: "Shop Created",
        description: "Submission converted to shop successfully.",
      });
    } catch (error) {
      console.error("Error converting to shop:", error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert submission to shop.",
        variant: "destructive",
      });
    }
  };

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.business_name.toLowerCase().includes(search.toLowerCase()) ||
      sub.contact_email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-12">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.map((submission) => (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{submission.business_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        submission.status === "approved"
                          ? "default"
                          : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {submission.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {submission.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => convertToShop(submission)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Create Shop
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus(submission.id, "rejected")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{submission.contact_name}</span>
                    <span className="text-muted-foreground">({submission.contact_email})</span>
                  </div>
                  {submission.contact_phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{submission.contact_phone}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <div>{submission.address}</div>
                      <div>
                        {submission.city}, {submission.state} {submission.zip_code}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {submission.website_url && (
                    <div className="text-sm">
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={submission.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {submission.website_url}
                      </a>
                    </div>
                  )}
                  {submission.description && (
                    <div className="text-sm">
                      <span className="font-medium">Description:</span>
                      <p className="text-muted-foreground mt-1">{submission.description}</p>
                    </div>
                  )}
                  {submission.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes:</span>
                      <p className="text-muted-foreground mt-1">{submission.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No submissions found.
          </div>
        )}
      </div>
    </div>
  );
};
