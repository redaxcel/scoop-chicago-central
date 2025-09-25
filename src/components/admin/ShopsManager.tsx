import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Check, Pause, PencilLine, Save, X } from "lucide-react";

interface ShopRow {
  id: string;
  name: string;
  status: "active" | "pending" | "closed" | "suspended";
  city: string;
  state: string;
  phone?: string | null;
  pricing?: "$" | "$$" | "$$$" | "$$$$" | null;
  website_url?: string | null;
  address: string;
  description?: string | null;
}

const statusBadgeVariant = (status: ShopRow["status"]) => {
  switch (status) {
    case "active":
      return "default" as const;
    case "pending":
      return "secondary" as const;
    case "suspended":
      return "secondary" as const;
    case "closed":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

export const ShopsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [selected, setSelected] = useState<ShopRow | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ice_cream_shops")
      .select("id,name,status,city,state,phone,pricing,website_url,address,description")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load shops", variant: "destructive" });
    } else {
      setShops((data as any) || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: ShopRow["status"]) => {
    const { error } = await supabase.from("ice_cream_shops").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: "Could not update status", variant: "destructive" });
    } else {
      toast({ title: "Status updated" });
      await refresh();
    }
  };

  const onSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { id, ...payload } = selected;
    const { error } = await supabase.from("ice_cream_shops").update(payload).eq("id", id);
    if (error) {
      console.error(error);
      toast({ title: "Update failed", description: "Check inputs and try again", variant: "destructive" });
    } else {
      toast({ title: "Shop updated", description: `${selected.name} saved successfully` });
      setSelected(null);
      refresh();
    }
    setSaving(false);
  };

  const filtered = shops.filter(s => {
    const matchesSearch = [s.name, s.city, s.state, s.address].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Shop Management</h3>
          <p className="text-muted-foreground">Approve, edit, and manage all shop listings</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="Search shops..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> All Shops</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading shops...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No shops found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{s.name}</td>
                      <td className="py-2 pr-4">{s.city}, {s.state}</td>
                      <td className="py-2 pr-4">{s.phone || "-"}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={statusBadgeVariant(s.status)} className="capitalize">{s.status}</Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setSelected(s)}>
                            <PencilLine className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          {s.status !== "active" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "active")}> <Check className="h-4 w-4 mr-1"/> Approve</Button>
                          )}
                          {s.status !== "suspended" && (
                            <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "suspended")}>
                              <Pause className="h-4 w-4 mr-1"/> Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Shop: {selected.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={selected.phone || ''} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={selected.address} onChange={(e) => setSelected({ ...selected, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={selected.website_url || ''} onChange={(e) => setSelected({ ...selected, website_url: e.target.value })} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pricing</Label>
                <Select value={selected.pricing || ''} onValueChange={(v) => setSelected({ ...selected, pricing: v as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ - Budget</SelectItem>
                    <SelectItem value="$$">$$ - Moderate</SelectItem>
                    <SelectItem value="$$$">$$$ - Premium</SelectItem>
                    <SelectItem value="$$$$">$$$$ - Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selected.status} onValueChange={(v) => setSelected({ ...selected, status: v as ShopRow["status"] })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelected(null)}>
                <X className="h-4 w-4 mr-1"/> Cancel
              </Button>
              <Button onClick={onSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1"/> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShopsManager;
