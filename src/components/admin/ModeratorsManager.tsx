import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  role: string;
  shop_id?: string;
}

interface Shop {
  id: string;
  name: string;
}

export const ModeratorsManager = () => {
  const { toast } = useToast();
  const [moderators, setModerators] = useState<Profile[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all moderators
    const { data: modsData, error: modsError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "moderator")
      .order("display_name");

    if (modsError) {
      console.error(modsError);
      toast({ title: "Error", description: "Failed to load moderators", variant: "destructive" });
    } else {
      setModerators((modsData as any) || []);
    }

    // Fetch all shops
    const { data: shopsData, error: shopsError } = await supabase
      .from("ice_cream_shops")
      .select("id, name")
      .eq("status", "active")
      .order("name");

    if (shopsError) {
      console.error(shopsError);
    } else {
      setShops((shopsData as any) || []);
    }

    setLoading(false);
  };

  const assignShop = async (profileId: string, shopId: string | null) => {
    const { error } = await supabase
      .from("profiles")
      .update({ shop_id: shopId })
      .eq("id", profileId);

    if (error) {
      toast({ title: "Failed", description: "Could not assign shop", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Shop assignment updated" });
      fetchData();
    }
  };

  const getShopName = (shopId?: string) => {
    if (!shopId) return null;
    return shops.find(s => s.id === shopId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Moderator Management</h3>
          <p className="text-muted-foreground">Assign moderators to manage specific shops</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Moderators & Shop Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading moderators...</div>
          ) : moderators.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No moderators found. Users with moderator role will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {moderators.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{mod.display_name || "Unnamed User"}</div>
                        <div className="text-xs text-muted-foreground">
                          {mod.shop_id ? (
                            <Badge variant="secondary">Assigned: {getShopName(mod.shop_id)}</Badge>
                          ) : (
                            <span className="text-muted-foreground">No shop assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={mod.shop_id || "none"}
                      onValueChange={(value) => assignShop(mod.id, value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Assign to shop..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No shop</SelectItem>
                        {shops.map((shop) => (
                          <SelectItem key={shop.id} value={shop.id}>
                            {shop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {mod.shop_id && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => assignShop(mod.id, null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shop Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shops.map((shop) => {
              const assignedMods = moderators.filter(m => m.shop_id === shop.id);
              return (
                <div key={shop.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium">{shop.name}</span>
                  <div className="flex gap-2">
                    {assignedMods.length > 0 ? (
                      assignedMods.map(mod => (
                        <Badge key={mod.id} variant="secondary">
                          {mod.display_name || "Unnamed"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No moderators</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeratorsManager;
