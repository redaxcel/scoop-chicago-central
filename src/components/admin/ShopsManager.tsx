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
import { Textarea } from "@/components/ui/textarea";

interface ShopRow {
  id: string;
  name: string;
  status: "active" | "pending" | "closed" | "suspended";
  city: string;
  state: string;
  zip_code?: string | null;
  phone?: string | null;
  pricing?: "$" | "$$" | "$$$" | "$$$$" | null;
  website_url?: string | null;
  address: string;
  description?: string | null;
  hours?: any;
  amenities?: string[];
  latitude?: number | null;
  longitude?: number | null;
  featured?: boolean;
  image_url?: string | null;
  gallery_images?: string[] | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
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
      .select("*")
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
                    <th className="py-2 pr-4">Featured</th>
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
                        <Badge variant={s.featured ? "default" : "outline"}>
                          {s.featured ? "Featured" : "Standard"}
                        </Badge>
                      </td>
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
                <Label>Name *</Label>
                <Input value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={selected.phone || ''} onChange={(e) => setSelected({ ...selected, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={selected.description || ''} 
                onChange={(e) => setSelected({ ...selected, description: e.target.value })} 
                placeholder="Shop description..."
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input value={selected.address} onChange={(e) => setSelected({ ...selected, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={selected.city} onChange={(e) => setSelected({ ...selected, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State *</Label>
                <Input value={selected.state} onChange={(e) => setSelected({ ...selected, state: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input value={selected.zip_code || ''} onChange={(e) => setSelected({ ...selected, zip_code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={selected.latitude || ''} 
                  onChange={(e) => setSelected({ ...selected, latitude: e.target.value ? parseFloat(e.target.value) : null })} 
                  placeholder="41.8781"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input 
                  type="number" 
                  step="any"
                  value={selected.longitude || ''} 
                  onChange={(e) => setSelected({ ...selected, longitude: e.target.value ? parseFloat(e.target.value) : null })} 
                  placeholder="-87.6298"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={selected.website_url || ''} onChange={(e) => setSelected({ ...selected, website_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Main Image URL</Label>
                <Input value={selected.image_url || ''} onChange={(e) => setSelected({ ...selected, image_url: e.target.value })} placeholder="https://..." />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={selected.facebook_url || ''} onChange={(e) => setSelected({ ...selected, facebook_url: e.target.value })} placeholder="https://facebook.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={selected.instagram_url || ''} onChange={(e) => setSelected({ ...selected, instagram_url: e.target.value })} placeholder="https://instagram.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Twitter URL</Label>
                <Input value={selected.twitter_url || ''} onChange={(e) => setSelected({ ...selected, twitter_url: e.target.value })} placeholder="https://twitter.com/..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gallery Images (comma-separated URLs)</Label>
              <Input 
                value={selected.gallery_images?.join(', ') || ''} 
                onChange={(e) => setSelected({ ...selected, gallery_images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                placeholder="https://..., https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Amenities (comma-separated)</Label>
              <Input 
                value={selected.amenities?.join(', ') || ''} 
                onChange={(e) => setSelected({ ...selected, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
                placeholder="parking, wifi, outdoor_seating"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
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
              <div className="space-y-2">
                <Label>Featured</Label>
                <Select value={selected.featured ? 'true' : 'false'} onValueChange={(v) => setSelected({ ...selected, featured: v === 'true' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-sm">SEO Settings</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input value={selected.seo_title || ''} onChange={(e) => setSelected({ ...selected, seo_title: e.target.value })} placeholder="Custom page title" />
                </div>
                <div className="space-y-2">
                  <Label>SEO Keywords</Label>
                  <Input value={selected.seo_keywords || ''} onChange={(e) => setSelected({ ...selected, seo_keywords: e.target.value })} placeholder="ice cream, chicago" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>SEO Description</Label>
                <Textarea 
                  value={selected.seo_description || ''} 
                  onChange={(e) => setSelected({ ...selected, seo_description: e.target.value })} 
                  placeholder="Meta description for search engines..."
                  rows={2}
                />
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