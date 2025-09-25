import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Save, Trash } from "lucide-react";

interface CouponRow {
  id: string;
  title: string;
  coupon_code?: string | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  valid_from?: string | null;
  valid_until: string;
  is_active?: boolean | null;
  description: string;
}

export const CouponsManager = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<CouponRow>>({ title: "", description: "", valid_until: "" });

  useEffect(() => { refresh(); }, []);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("id,title,coupon_code,discount_percent,discount_amount,valid_from,valid_until,is_active,description")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load coupons", variant: "destructive" });
    } else {
      setCoupons((data as any) || []);
    }
    setLoading(false);
  };

  const createCoupon = async () => {
    if (!newCoupon.title || !newCoupon.valid_until || !newCoupon.description) {
      toast({ title: "Missing info", description: "Title, description and valid until are required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("coupons").insert({
      title: newCoupon.title,
      description: newCoupon.description,
      coupon_code: newCoupon.coupon_code || null,
      discount_percent: newCoupon.discount_percent ?? null,
      discount_amount: newCoupon.discount_amount ?? null,
      valid_until: newCoupon.valid_until,
      is_active: true,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Failed", description: "Could not create coupon", variant: "destructive" });
    } else {
      toast({ title: "Coupon created" });
      setNewCoupon({ title: "", description: "", valid_until: "" });
      refresh();
    }
  };

  const toggleActive = async (c: CouponRow) => {
    const { error } = await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) {
      toast({ title: "Failed", description: "Could not update status", variant: "destructive" });
    } else {
      setCoupons(coupons.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
    }
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed", description: "Could not delete coupon", variant: "destructive" });
    } else {
      setCoupons(coupons.filter(c => c.id !== id));
      toast({ title: "Coupon deleted" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Coupon Management</h3>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" /> Create New Coupon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newCoupon.title || ''} onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Coupon Code (optional)</Label>
              <Input value={newCoupon.coupon_code || ''} onChange={(e) => setNewCoupon({ ...newCoupon, coupon_code: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input type="date" value={newCoupon.valid_until || ''} onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input type="number" value={newCoupon.discount_percent ?? ''} onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label>Discount Amount</Label>
              <Input type="number" value={newCoupon.discount_amount ?? ''} onChange={(e) => setNewCoupon({ ...newCoupon, discount_amount: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newCoupon.description || ''} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} />
            </div>
          </div>
          <Button onClick={createCoupon} disabled={creating}>
            <Save className="h-4 w-4 mr-1"/> {creating ? 'Creating...' : 'Create Coupon'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-sm text-muted-foreground">No coupons found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Code</th>
                    <th className="py-2 pr-4">Discount</th>
                    <th className="py-2 pr-4">Valid Until</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">{c.title}</td>
                      <td className="py-2 pr-4">{c.coupon_code || '-'}</td>
                      <td className="py-2 pr-4">{c.discount_percent ? `${c.discount_percent}%` : (c.discount_amount ? `$${c.discount_amount}` : '-')}</td>
                      <td className="py-2 pr-4">{c.valid_until ? new Date(c.valid_until).toLocaleDateString() : '-'}</td>
                      <td className="py-2 pr-4"><Switch checked={!!c.is_active} onCheckedChange={() => toggleActive(c)} /></td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => deleteCoupon(c.id)}>
                            <Trash className="h-4 w-4 mr-1"/> Delete
                          </Button>
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
    </div>
  );
};

export default CouponsManager;
