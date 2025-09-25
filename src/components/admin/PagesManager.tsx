import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save, Trash } from "lucide-react";

interface PageRow {
  id: string;
  title: string;
  slug: string;
  meta_description?: string | null;
  is_published?: boolean | null;
  og_title?: string | null;
  og_description?: string | null;
  meta_keywords?: string | null;
}

export const PagesManager = () => {
  const { toast } = useToast();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PageRow | null>(null);
  const [newPage, setNewPage] = useState<Partial<PageRow>>({ title: "", slug: "" });

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pages")
      .select("id,title,slug,meta_description,is_published,og_title,og_description,meta_keywords")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load pages", variant: "destructive" });
    } else {
      setPages((data as any) || []);
    }
    setLoading(false);
  };

  const createPage = async () => {
    if (!newPage.title || !newPage.slug) {
      toast({ title: "Missing info", description: "Title and slug are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("pages").insert({
      title: newPage.title,
      slug: newPage.slug,
      is_published: true,
      meta_description: newPage.meta_description || null,
      og_title: newPage.og_title || null,
      og_description: newPage.og_description || null,
      meta_keywords: newPage.meta_keywords || null,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Failed", description: "Could not create page", variant: "destructive" });
    } else {
      toast({ title: "Page created" });
      setNewPage({ title: "", slug: "" });
      refresh();
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { id, ...payload } = editing;
    const { error } = await supabase.from("pages").update(payload).eq("id", id);
    if (error) {
      toast({ title: "Failed", description: "Could not update page", variant: "destructive" });
    } else {
      toast({ title: "Page updated" });
      setEditing(null);
      refresh();
    }
  };

  const deletePage = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed", description: "Could not delete page", variant: "destructive" });
    } else {
      setPages(pages.filter(p => p.id !== id));
      toast({ title: "Page deleted" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO & Page Management</h3>
          <p className="text-muted-foreground">Manage page content and meta information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Create New Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newPage.title || ''} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={newPage.slug || ''} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Input value={newPage.meta_description || ''} onChange={(e) => setNewPage({ ...newPage, meta_description: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input value={newPage.og_title || ''} onChange={(e) => setNewPage({ ...newPage, og_title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>OG Description</Label>
              <Input value={newPage.og_description || ''} onChange={(e) => setNewPage({ ...newPage, og_description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Meta Keywords</Label>
              <Input value={newPage.meta_keywords || ''} onChange={(e) => setNewPage({ ...newPage, meta_keywords: e.target.value })} />
            </div>
          </div>
          <Button onClick={createPage} disabled={creating}>
            <Save className="h-4 w-4 mr-1"/> {creating ? 'Creating...' : 'Create Page'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pages found.</div>
          ) : (
            <div className="space-y-2">
              {pages.map((p) => (
                <div key={p.id} className="border rounded-lg p-3">
                  {editing?.id === p.id ? (
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Title</Label>
                          <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label>Slug</Label>
                          <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Switch checked={!!editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
                          <span className="text-sm">Published</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Meta Description</Label>
                          <Input value={editing.meta_description || ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label>OG Title</Label>
                          <Input value={editing.og_title || ''} onChange={(e) => setEditing({ ...editing, og_title: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <Label>OG Description</Label>
                          <Input value={editing.og_description || ''} onChange={(e) => setEditing({ ...editing, og_description: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button onClick={saveEdit}><Save className="h-4 w-4 mr-1"/> Save</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.title} <span className="text-muted-foreground">/ {p.slug}</span></div>
                        <div className="text-xs text-muted-foreground">{p.meta_description || 'No meta description'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => deletePage(p.id)}><Trash className="h-4 w-4 mr-1"/> Delete</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PagesManager;
