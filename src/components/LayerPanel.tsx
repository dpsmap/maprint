import { Eye, EyeOff, Maximize2, Trash2, Layers, Square, Minus, Circle } from 'lucide-react';
import { ShapefileLayer } from '@/types/gis';
import { t } from '@/lib/translations';
import { FileUpload } from './FileUpload';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface LayerPanelProps {
  layers: ShapefileLayer[];
  isLoading: boolean;
  onFilesSelected: (files: File[]) => void;
  onToggleVisibility: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onRemoveLayer: (layerId: string) => void;
  onFitToLayer: (layer: ShapefileLayer) => void;
}

function LayerIcon({ type }: { type: ShapefileLayer['type'] }) {
  switch (type) {
    case 'polygon':
      return <Square className="w-4 h-4" />;
    case 'line':
      return <Minus className="w-4 h-4" />;
    case 'point':
      return <Circle className="w-4 h-4" />;
  }
}

export function LayerPanel({
  layers,
  isLoading,
  onFilesSelected,
  onToggleVisibility,
  onOpacityChange,
  onRemoveLayer,
  onFitToLayer
}: LayerPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
        <Layers className="w-5 h-5 text-sidebar-active" />
        <h2 className="font-semibold font-myanmar text-sidebar-foreground">{t.chooseLayers}</h2>
      </div>

      {/* Upload Section */}
      <div className="p-4 border-b border-sidebar-border">
        <FileUpload onFilesSelected={onFilesSelected} isLoading={isLoading} />
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {layers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-myanmar">{t.noLayersYet}</p>
            <p className="text-xs mt-1 font-myanmar">{t.addShapefiles}</p>
          </div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              className={cn(
                'layer-item animate-slide-in bg-sidebar-hover/50 rounded-lg',
                layer.visible && 'border-l-2 border-sidebar-active'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Layer Header */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => onToggleVisibility(layer.id)}
                  className="p-1 hover:bg-sidebar-hover rounded transition-colors"
                  title={t.toggleLayer}
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4 text-sidebar-active" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                
                <div
                  className="w-4 h-4 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: layer.color }}
                >
                  <LayerIcon type={layer.type} />
                </div>
                
                <span className="flex-1 text-sm font-medium truncate text-sidebar-foreground">
                  {layer.name}
                </span>
                
                <button
                  onClick={() => onFitToLayer(layer)}
                  className="p-1 hover:bg-sidebar-hover rounded transition-colors"
                  title={t.fitToLayer}
                >
                  <Maximize2 className="w-4 h-4 text-muted-foreground hover:text-sidebar-foreground" />
                </button>
                
                <button
                  onClick={() => onRemoveLayer(layer.id)}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  title={t.removeLayer}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
              
              {/* Opacity Slider */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs text-muted-foreground font-myanmar w-16">
                  {t.opacity}
                </span>
                <Slider
                  value={[layer.opacity * 100]}
                  onValueChange={([value]) => onOpacityChange(layer.id, value / 100)}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
