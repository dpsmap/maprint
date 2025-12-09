import { useState } from 'react';
import { Printer, X, Navigation, Ruler, List, FileText, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrintOptions, ShapefileLayer, PAGE_SIZES } from '@/types/gis';
import { t } from '@/lib/translations';

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  layers: ShapefileLayer[];
  onPrint: (options: PrintOptions) => void;
  isExporting: boolean;
}

const defaultOptions: PrintOptions = {
  title: 'မြန်မာပြည်မြေပုံ',
  author: '',
  date: new Date().toLocaleDateString('my-MM'),
  pageSize: 'A4',
  orientation: 'portrait',
  format: 'png',
  showNorthArrow: true,
  showScaleBar: true,
  showLegend: true,
  showMetadata: true,
  dpi: 150
};

export function PrintDialog({ open, onClose, layers, onPrint, isExporting }: PrintDialogProps) {
  const [options, setOptions] = useState<PrintOptions>(defaultOptions);

  const handlePrint = () => {
    onPrint(options);
  };

  const updateOption = <K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] font-myanmar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-myanmar">
            <Printer className="w-5 h-5 text-primary" />
            {t.printMap}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title & Author */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.mapTitle}</label>
              <Input
                value={options.title}
                onChange={(e) => updateOption('title', e.target.value)}
                className="input-gis font-myanmar"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t.author}</label>
                <Input
                  value={options.author}
                  onChange={(e) => updateOption('author', e.target.value)}
                  className="input-gis"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t.date}</label>
                <Input
                  value={options.date}
                  onChange={(e) => updateOption('date', e.target.value)}
                  className="input-gis font-myanmar"
                />
              </div>
            </div>
          </div>

          {/* Page Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.pageSize}</label>
              <Select
                value={options.pageSize}
                onValueChange={(value) => updateOption('pageSize', value as PrintOptions['pageSize'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PAGE_SIZES).map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.orientation}</label>
              <Select
                value={options.orientation}
                onValueChange={(value) => updateOption('orientation', value as PrintOptions['orientation'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">{t.portrait}</SelectItem>
                  <SelectItem value="landscape">{t.landscape}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Export Format & DPI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t.exportFormat}</label>
              <Select
                value={options.format}
                onValueChange={(value) => updateOption('format', value as PrintOptions['format'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t.dpi}</label>
              <Select
                value={options.dpi.toString()}
                onValueChange={(value) => updateOption('dpi', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72">72 DPI</SelectItem>
                  <SelectItem value="150">150 DPI</SelectItem>
                  <SelectItem value="300">300 DPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Map Elements */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">မြေပုံအစိတ်အပိုင်းများ</h4>
            
            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t.northArrow}</span>
              </div>
              <Switch
                checked={options.showNorthArrow}
                onCheckedChange={(checked) => updateOption('showNorthArrow', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t.scaleBar}</span>
              </div>
              <Switch
                checked={options.showScaleBar}
                onCheckedChange={(checked) => updateOption('showScaleBar', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t.legend}</span>
              </div>
              <Switch
                checked={options.showLegend}
                onCheckedChange={(checked) => updateOption('showLegend', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t.metadata}</span>
              </div>
              <Switch
                checked={options.showMetadata}
                onCheckedChange={(checked) => updateOption('showMetadata', checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            {t.cancel}
          </Button>
          <Button onClick={handlePrint} disabled={isExporting} className="gap-2">
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {t.processing}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t.exportMap}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
