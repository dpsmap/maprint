import { useState, useRef, useCallback } from 'react';
import { Printer, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { LayerPanel } from '@/components/LayerPanel';
import { BaseMapSelector } from '@/components/BaseMapSelector';
import { MapView, MapViewRef } from '@/components/MapView';
import { PrintDialog } from '@/components/PrintDialog';
import { PrintLayout } from '@/components/PrintLayout';
import { useShapefiles } from '@/hooks/useShapefiles';
import { useMapExport } from '@/hooks/useMapExport';
import { t } from '@/lib/translations';
import { PrintOptions, ShapefileLayer } from '@/types/gis';
import { cn } from '@/lib/utils';

const Index = () => {
  const [selectedBaseMap, setSelectedBaseMap] = useState('osm');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printOptions, setPrintOptions] = useState<PrintOptions | null>(null);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);

  const mapRef = useRef<MapViewRef>(null);
  const printLayoutRef = useRef<HTMLDivElement>(null);

  const {
    layers,
    isLoading,
    processFiles,
    toggleLayerVisibility,
    setLayerOpacity,
    removeLayer
  } = useShapefiles();

  const { isExporting, exportMap, captureMapImage, calculateScale } = useMapExport();

  const handleFitToLayer = useCallback((layer: ShapefileLayer) => {
    if (mapRef.current) {
      mapRef.current.fitToBounds(layer.bounds);
    }
  }, []);

  const handlePrint = useCallback(async (options: PrintOptions) => {
    // First capture the map image
    const imageUrl = await captureMapImage();
    setMapImageUrl(imageUrl);
    setPrintOptions(options);

    // Wait for the print layout to render, then export
    setTimeout(async () => {
      if (printLayoutRef.current) {
        await exportMap(options, layers, printLayoutRef.current);
      }
      setPrintDialogOpen(false);
      setPrintOptions(null);
      setMapImageUrl(null);
    }, 500);
  }, [captureMapImage, exportMap, layers]);

  const scale = mapRef.current ? calculateScale(mapRef.current.getMap()) : '1:100,000';

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-20',
          sidebarOpen ? 'w-80' : 'w-0'
        )}
      >
        <div className={cn('flex flex-col h-full', !sidebarOpen && 'invisible')}>
          {/* Logo/Title */}
          <div className="px-4 py-4 border-b border-sidebar-border">
            <h1 className="text-lg font-bold font-myanmar text-sidebar-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-active flex items-center justify-center">
                <span className="text-white text-sm font-bold">MM</span>
              </div>
              {t.appTitle}
            </h1>
            <p className="text-xs text-muted-foreground font-myanmar mt-1">
              {t.appSubtitle}
            </p>
          </div>

          {/* Layer Panel */}
          <div className="flex-1 overflow-hidden">
            <LayerPanel
              layers={layers}
              isLoading={isLoading}
              onFilesSelected={processFiles}
              onToggleVisibility={toggleLayerVisibility}
              onOpacityChange={setLayerOpacity}
              onRemoveLayer={removeLayer}
              onFitToLayer={handleFitToLayer}
            />
          </div>

          {/* Base Map Selector */}
          <div className="border-t border-sidebar-border">
            <BaseMapSelector
              selectedBaseMap={selectedBaseMap}
              onSelectBaseMap={setSelectedBaseMap}
            />
          </div>
        </div>
      </aside>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          'absolute top-4 z-30 p-2 bg-card rounded-lg shadow-lg border border-border transition-all duration-300',
          sidebarOpen ? 'left-[19rem]' : 'left-4'
        )}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Top Bar */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={() => setPrintDialogOpen(true)}
            className="btn-gis font-myanmar gap-2"
          >
            <Printer className="w-4 h-4" />
            {t.printMap}
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 p-4 pt-16">
          <div className="map-container w-full h-full">
            <MapView
              ref={mapRef}
              layers={layers}
              selectedBaseMap={selectedBaseMap}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-card border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="font-myanmar">{t.layers}: {layers.filter(l => l.visible).length}/{layers.length}</span>
            <span>|</span>
            <span>WGS 84</span>
          </div>
          <div>
            <span>{t.scaleBar}: {scale}</span>
          </div>
        </div>
      </main>

      {/* Print Dialog */}
      <PrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        layers={layers}
        onPrint={handlePrint}
        isExporting={isExporting}
      />

      {/* Hidden Print Layout for Export */}
      {printOptions && (
        <div className="fixed -left-[9999px] -top-[9999px]">
          <PrintLayout
            ref={printLayoutRef}
            options={printOptions}
            layers={layers}
            mapImageUrl={mapImageUrl}
            scale={scale}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
