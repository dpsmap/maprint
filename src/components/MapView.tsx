import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShapefileLayer, BASE_MAPS } from '@/types/gis';

interface MapViewProps {
  layers: ShapefileLayer[];
  selectedBaseMap: string;
}

export interface MapViewRef {
  fitToBounds: (bounds: [[number, number], [number, number]]) => void;
  getMap: () => L.Map | null;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(({ layers, selectedBaseMap }, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.GeoJSON>>(new Map());
  const baseLayerRef = useRef<L.TileLayer | null>(null);

  useImperativeHandle(ref, () => ({
    fitToBounds: (bounds: [[number, number], [number, number]]) => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    },
    getMap: () => mapRef.current
  }));

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: [21.9162, 95.956],
      zoom: 6,
      zoomControl: true
    });

    const baseMap = BASE_MAPS.find(b => b.id === selectedBaseMap) || BASE_MAPS[0];
    baseLayerRef.current = L.tileLayer(baseMap.url, {
      attribution: baseMap.attribution
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update base layer
  useEffect(() => {
    if (!mapRef.current) return;

    const baseMap = BASE_MAPS.find(b => b.id === selectedBaseMap) || BASE_MAPS[0];
    
    if (baseLayerRef.current) {
      mapRef.current.removeLayer(baseLayerRef.current);
    }
    
    baseLayerRef.current = L.tileLayer(baseMap.url, {
      attribution: baseMap.attribution
    }).addTo(mapRef.current);
    
    baseLayerRef.current.bringToBack();
  }, [selectedBaseMap]);

  // Update layers
  useEffect(() => {
    if (!mapRef.current) return;

    const currentLayerIds = new Set(layers.map(l => l.id));
    
    // Remove layers that no longer exist
    layersRef.current.forEach((leafletLayer, layerId) => {
      if (!currentLayerIds.has(layerId)) {
        mapRef.current!.removeLayer(leafletLayer);
        layersRef.current.delete(layerId);
      }
    });

    // Add or update layers
    layers.forEach(layer => {
      const existingLayer = layersRef.current.get(layer.id);
      
      if (existingLayer) {
        if (layer.visible) {
          if (!mapRef.current!.hasLayer(existingLayer)) {
            existingLayer.addTo(mapRef.current!);
          }
          existingLayer.setStyle({ 
            opacity: layer.opacity,
            fillOpacity: layer.opacity * 0.5
          });
        } else {
          mapRef.current!.removeLayer(existingLayer);
        }
      } else {
        const geojsonLayer = L.geoJSON(layer.geojson, {
          style: () => ({
            color: layer.color,
            weight: layer.type === 'line' ? 3 : 2,
            opacity: layer.opacity,
            fillColor: layer.color,
            fillOpacity: layer.type === 'polygon' ? layer.opacity * 0.5 : 0
          }),
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              color: layer.color,
              weight: 2,
              opacity: layer.opacity,
              fillColor: layer.color,
              fillOpacity: layer.opacity * 0.7
            });
          },
          onEachFeature: (feature, featureLayer) => {
            if (feature.properties) {
              const popupContent = Object.entries(feature.properties)
                .filter(([, value]) => value !== null && value !== undefined)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>');
              
              if (popupContent) {
                featureLayer.bindPopup(popupContent, { maxWidth: 300 });
              }
            }
          }
        });

        if (layer.visible) {
          geojsonLayer.addTo(mapRef.current!);
        }
        
        layersRef.current.set(layer.id, geojsonLayer);
      }
    });
  }, [layers]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-xl overflow-hidden"
      id="map-container"
    />
  );
});

MapView.displayName = 'MapView';
