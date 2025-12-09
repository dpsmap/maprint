import { PrintOptions, ShapefileLayer, PAGE_SIZES } from '@/types/gis';
import { t } from '@/lib/translations';
import { forwardRef } from 'react';

interface PrintLayoutProps {
  options: PrintOptions;
  layers: ShapefileLayer[];
  mapImageUrl: string | null;
  scale: string;
}

export const PrintLayout = forwardRef<HTMLDivElement, PrintLayoutProps>(
  ({ options, layers, mapImageUrl, scale }, ref) => {
    const pageSize = PAGE_SIZES[options.pageSize];
    const isLandscape = options.orientation === 'landscape';
    const width = isLandscape ? pageSize.height : pageSize.width;
    const height = isLandscape ? pageSize.width : pageSize.height;

    const scaleFactor = 3.78;

    return (
      <div
        ref={ref}
        className="bg-white p-8"
        style={{
          width: `${width * scaleFactor}px`,
          height: `${height * scaleFactor}px`,
          fontFamily: "'Padauk', 'Inter', sans-serif"
        }}
      >
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{options.title}</h1>
        </div>

        <div 
          className="relative bg-gray-100"
          style={{ 
            height: options.showLegend ? '65%' : '75%',
            border: '2px solid #1a1a1a'
          }}
        >
          {mapImageUrl ? (
            <img 
              src={mapImageUrl} 
              alt="Map" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              မြေပုံဓာတ်ပုံ
            </div>
          )}

          {options.showNorthArrow && (
            <div className="absolute top-4 right-4 w-12 h-16 flex flex-col items-center">
              <svg viewBox="0 0 40 60" className="w-full h-full">
                <polygon 
                  points="20,0 30,40 20,35 10,40" 
                  fill="#1a1a1a"
                />
                <text 
                  x="20" 
                  y="55" 
                  textAnchor="middle" 
                  className="text-xs font-bold"
                  fill="#1a1a1a"
                >
                  N
                </text>
              </svg>
            </div>
          )}

          {options.showScaleBar && (
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded border border-gray-300">
              <div className="flex items-end gap-1">
                <div className="flex">
                  <div className="w-8 h-2 bg-black" />
                  <div className="w-8 h-2 bg-white border border-black" />
                  <div className="w-8 h-2 bg-black" />
                </div>
              </div>
              <div className="text-xs text-center mt-1 font-medium">{scale}</div>
            </div>
          )}
        </div>

        {options.showLegend && layers.filter(l => l.visible).length > 0 && (
          <div className="mt-4 p-4 border border-gray-300 rounded">
            <h3 className="font-bold text-sm mb-3">{t.legend}</h3>
            <div className="grid grid-cols-3 gap-2">
              {layers.filter(l => l.visible).map(layer => (
                <div key={layer.id} className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-xs truncate">{layer.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {options.showMetadata && (
          <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600 grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">{t.projection}:</span> WGS 84 (EPSG:4326)
            </div>
            <div>
              <span className="font-medium">{t.date}:</span> {options.date}
            </div>
            {options.author && (
              <div>
                <span className="font-medium">{t.author}:</span> {options.author}
              </div>
            )}
            <div>
              <span className="font-medium">{t.createdWith}:</span> Myanmar GIS Map System
            </div>
          </div>
        )}
      </div>
    );
  }
);

PrintLayout.displayName = 'PrintLayout';
