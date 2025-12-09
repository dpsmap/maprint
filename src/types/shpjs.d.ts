declare module 'shpjs' {
  import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
  
  interface ShpjsResult extends FeatureCollection<Geometry, GeoJsonProperties> {}
  
  function shp(buffer: ArrayBuffer | string): Promise<ShpjsResult | ShpjsResult[]>;
  
  namespace shp {
    function parseShp(shp: ArrayBuffer, dbf?: ArrayBuffer): Promise<any>;
    function parseDbf(dbf: ArrayBuffer): Promise<any[]>;
  }
  
  export = shp;
}
