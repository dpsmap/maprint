export interface ShapefileLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  geojson: any;
  type: 'polygon' | 'line' | 'point';
  color: string;
  bounds: [[number, number], [number, number]];
}

export interface PrintOptions {
  title: string;
  author: string;
  date: string;
  pageSize: 'A4' | 'A3' | 'A2' | 'A1' | 'A0';
  orientation: 'portrait' | 'landscape';
  format: 'pdf' | 'png' | 'jpg';
  showNorthArrow: boolean;
  showScaleBar: boolean;
  showLegend: boolean;
  showMetadata: boolean;
  dpi: number;
}

export interface BaseMap {
  id: string;
  name: string;
  nameMyanmar: string;
  url: string;
  attribution: string;
}

export const BASE_MAPS: BaseMap[] = [
  {
    id: 'osm',
    name: 'OpenStreetMap',
    nameMyanmar: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  {
    id: 'esri-satellite',
    name: 'ESRI Satellite',
    nameMyanmar: 'ဂြိုလ်တုပုံ',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  {
    id: 'esri-topo',
    name: 'ESRI Topographic',
    nameMyanmar: 'မြေမျက်နှာသွင်ပြင်ပုံ',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  },
  {
    id: 'carto-light',
    name: 'CartoDB Light',
    nameMyanmar: 'CartoDB အလင်း',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB'
  }
];

export const PAGE_SIZES: Record<string, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  A1: { width: 594, height: 841 },
  A0: { width: 841, height: 1189 }
};

export const LAYER_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];
