import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import { Download, FileDown, Upload } from "lucide-react";

interface AnyRow { [key: string]: any }

type ImportType = 'shops' | 'events' | 'coupons';

const columnsByType: Record<ImportType, string[]> = {
  shops: [
    'name','address','city','state','zip_code','phone','pricing','website_url','facebook_url','instagram_url','description','status'
  ],
  events: [
    'title','event_date','end_date','location','is_featured','image_url','registration_url'
  ],
  coupons: [
    'title','coupon_code','discount_percent','discount_amount','valid_until','description','is_active'
  ],
};

function toCSV(data: AnyRow[], headers: string[]) {
  return Papa.unparse({ fields: headers, data: data.map(r => headers.map(h => r[h] ?? '')) });
}

function download(filename: string, content: string, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const ImportExportManager = () => {
  const { toast } = useToast();
  const [importType, setImportType] = useState<ImportType>('shops');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const sampleCSV = useMemo(() => {
    const headers = columnsByType[importType];
    const sampleRow: AnyRow = Object.fromEntries(headers.map(h => [h, '']));
    if (importType === 'shops') {
      sampleRow.name = 'Sweet Scoops';
      sampleRow.address = '123 Main St';
      sampleRow.city = 'Chicago';
      sampleRow.state = 'IL';
      sampleRow.zip_code = '60601';
      sampleRow.pricing = '$$';
      sampleRow.status = 'pending';
    }
    if (importType === 'events') {
      sampleRow.title = 'Summer Ice Cream Fest';
      sampleRow.event_date = new Date().toISOString();
    }
    if (importType === 'coupons') {
      sampleRow.title = '10% OFF';
      sampleRow.discount_percent = 10;
      sampleRow.valid_until = new Date(Date.now()+7*24*60*60*1000).toISOString().slice(0,10);
      sampleRow.description = 'Save on any scoop!';
    }
    return toCSV([sampleRow], headers);
  }, [importType]);

  const handleChooseFile = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<AnyRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        await doImport(rows);
        if (fileRef.current) fileRef.current.value = '';
      },
      error: (err) => {
        console.error(err);
        toast({ title: 'CSV Error', description: 'Could not parse file', variant: 'destructive' });
      }
    });
  };

  const doImport = async (rows: AnyRow[]) => {
    setImporting(true);
    try {
      const allowed = columnsByType[importType];
      const cleaned = rows.map(r => Object.fromEntries(Object.entries(r).filter(([k]) => allowed.includes(k))));

      if (importType === 'shops') {
        const { error } = await supabase.from('ice_cream_shops').insert(cleaned);
        if (error) throw error;
      } else if (importType === 'events') {
        const { error } = await supabase.from('events').insert(cleaned);
        if (error) throw error;
      } else if (importType === 'coupons') {
        const { error } = await supabase.from('coupons').insert(cleaned);
        if (error) throw error;
      }

      toast({ title: 'Import complete', description: `${rows.length} rows imported` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Import failed', description: 'Please verify your CSV columns match the template', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const exportAll = async (type: ImportType) => {
    const headers = columnsByType[type];
    if (type === 'shops') {
      const { data, error } = await supabase.from('ice_cream_shops').select(headers.join(','));
      if (error) return toast({ title: 'Export failed', variant: 'destructive' });
      download('shops.csv', toCSV((data as AnyRow[]) || [], headers));
    }
    if (type === 'events') {
      const { data, error } = await supabase.from('events').select(headers.join(','));
      if (error) return toast({ title: 'Export failed', variant: 'destructive' });
      download('events.csv', toCSV((data as AnyRow[]) || [], headers));
    }
    if (type === 'coupons') {
      const { data, error } = await supabase.from('coupons').select(headers.join(','));
      if (error) return toast({ title: 'Export failed', variant: 'destructive' });
      download('coupons.csv', toCSV((data as AnyRow[]) || [], headers));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Import Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Import Type</Label>
              <Select value={importType} onValueChange={(v) => setImportType(v as ImportType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select import type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shops">Ice Cream Shops</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="coupons">Coupons</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Upload CSV</Label>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
              <Button onClick={handleChooseFile} disabled={importing}>
                <Upload className="h-4 w-4 mr-1"/> {importing ? 'Importing...' : 'Choose File'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Sample CSV</Label>
              <Button variant="outline" onClick={() => download(`${importType}-sample.csv`, sampleCSV)}>
                <FileDown className="h-4 w-4 mr-1"/> Download Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5"/> Export Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => exportAll('shops')}>Export All Shops</Button>
            <Button variant="outline" onClick={() => exportAll('events')}>Export All Events</Button>
            <Button variant="outline" onClick={() => exportAll('coupons')}>Export All Coupons</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExportManager;
