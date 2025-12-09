import { useState, useCallback } from 'react';
import shp from 'shpjs';
import { ShapefileLayer, LAYER_COLORS } from '@/types/gis';
import { toast } from '@/hooks/use-toast';
import { t } from '@/lib/translations';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function detectGeometryType(geojson: any): 'polygon' | 'line' | 'point' {
  if (geojson.type === 'FeatureCollection' && geojson.features && geojson.features.length > 0) {
    const firstFeature = geojson.features[0];
    if (firstFeature.geometry) {
      const type = firstFeature.geometry.type;
      if (type.includes('Polygon')) return 'polygon';
      if (type.includes('Line')) return 'line';
    }
    return 'point';
  }
  return 'polygon';
}

function calculateBounds(geojson: any): [[number, number], [number, number]] {
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;

  const processCoords = (coords: number[]) => {
    const [lng, lat] = coords;
    if (typeof lat === 'number' && typeof lng === 'number') {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    }
  };

  const flattenCoords = (coords: any): void => {
    if (Array.isArray(coords)) {
      if (typeof coords[0] === 'number') {
        processCoords(coords as number[]);
      } else {
        coords.forEach(flattenCoords);
      }
    }
  };

  const processGeometry = (geometry: any) => {
    if (!geometry || !geometry.coordinates) return;
    flattenCoords(geometry.coordinates);
  };

  if (geojson.type === 'FeatureCollection' && geojson.features) {
    geojson.features.forEach((feature: any) => {
      if (feature.geometry) {
        processGeometry(feature.geometry);
      }
    });
  } else if (geojson.type === 'Feature' && geojson.geometry) {
    processGeometry(geojson.geometry);
  }

  // Default bounds if calculation fails (Myanmar bounds)
  if (!isFinite(minLat)) {
    return [[20.0, 92.0], [28.0, 101.0]];
  }

  return [[minLat, minLng], [maxLat, maxLng]];
}

export function useShapefiles() {
  const [layers, setLayers] = useState<ShapefileLayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const processFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    
    try {
      // Group files by base name
      const fileGroups: Record<string, File[]> = {};
      
      files.forEach(file => {
        const baseName = file.name.replace(/\.(shp|shx|dbf|prj|cpg)$/i, '');
        if (!fileGroups[baseName]) {
          fileGroups[baseName] = [];
        }
        fileGroups[baseName].push(file);
      });

      // Process each shapefile group
      for (const [baseName, groupFiles] of Object.entries(fileGroups)) {
        const shpFile = groupFiles.find(f => f.name.toLowerCase().endsWith('.shp'));
        
        if (!shpFile) continue;

        try {
          // Read the shapefile as ArrayBuffer
          const arrayBuffer = await shpFile.arrayBuffer();
          
          // Parse using shpjs
          const result = await shp(arrayBuffer);
          const geojson = Array.isArray(result) ? result[0] : result;

          const geometryType = detectGeometryType(geojson);
          const bounds = calculateBounds(geojson);
          
          setLayers(prev => {
            const colorIndex = prev.length % LAYER_COLORS.length;
            const newLayer: ShapefileLayer = {
              id: generateId(),
              name: baseName,
              visible: true,
              opacity: 0.8,
              geojson,
              type: geometryType,
              color: LAYER_COLORS[colorIndex],
              bounds
            };
            return [...prev, newLayer];
          });

          toast({
            title: t.success,
            description: `${baseName} ${t.shapefileLoaded}`,
          });
        } catch (error) {
          console.error(`Error processing ${baseName}:`, error);
          toast({
            title: t.error,
            description: `${baseName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: 'destructive'
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);

  const setLayerOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  }, []);

  const removeLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  }, []);

  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const [removed] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, removed);
      return newLayers;
    });
  }, []);

  return {
    layers,
    isLoading,
    processFiles,
    toggleLayerVisibility,
    setLayerOpacity,
    removeLayer,
    reorderLayers
  };
}
