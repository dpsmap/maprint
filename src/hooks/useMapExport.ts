import { useState, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PrintOptions, PAGE_SIZES, ShapefileLayer } from '@/types/gis';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/translations';
import type { Map as LeafletMap } from 'leaflet';

export function useMapExport() {
  const [isExporting, setIsExporting] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const captureMapImage = useCallback(async (): Promise<string | null> => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return null;

    try {
      const canvas = await html2canvas(mapContainer, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing map:', error);
      return null;
    }
  }, []);

  const exportMap = useCallback(async (
    options: PrintOptions,
    layers: ShapefileLayer[],
    mapElement: HTMLElement | null
  ) => {
    if (!mapElement) {
      toast({
        title: t.error,
        description: 'Map element not found',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      // Capture the print layout
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: options.dpi / 96,
        backgroundColor: '#ffffff'
      });

      const pageSize = PAGE_SIZES[options.pageSize];
      const isLandscape = options.orientation === 'landscape';
      const width = isLandscape ? pageSize.height : pageSize.width;
      const height = isLandscape ? pageSize.width : pageSize.height;

      if (options.format === 'pdf') {
        const pdf = new jsPDF({
          orientation: options.orientation,
          unit: 'mm',
          format: options.pageSize.toLowerCase() as any
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${options.title || 'map'}.pdf`);
      } else {
        // PNG or JPG
        const link = document.createElement('a');
        link.download = `${options.title || 'map'}.${options.format}`;
        
        if (options.format === 'jpg') {
          const jpgCanvas = document.createElement('canvas');
          jpgCanvas.width = canvas.width;
          jpgCanvas.height = canvas.height;
          const ctx = jpgCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
            ctx.drawImage(canvas, 0, 0);
          }
          link.href = jpgCanvas.toDataURL('image/jpeg', 0.95);
        } else {
          link.href = canvas.toDataURL('image/png');
        }
        
        link.click();
      }

      toast({
        title: t.success,
        description: t.exportComplete
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Export failed',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  const calculateScale = useCallback((map: LeafletMap | null): string => {
    if (!map) return '1:100,000';

    const zoom = map.getZoom();
    const lat = map.getCenter().lat;
    
    const metersPerPixel = 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom);
    const scale = Math.round(metersPerPixel * 96 * 39.37);
    
    if (scale >= 1000000) {
      return `1:${(scale / 1000000).toFixed(1)}M`;
    } else if (scale >= 1000) {
      return `1:${(scale / 1000).toFixed(0)}K`;
    }
    return `1:${scale}`;
  }, []);

  return {
    isExporting,
    exportMap,
    captureMapImage,
    calculateScale,
    printContainerRef
  };
}
