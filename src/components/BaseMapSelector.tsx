import { Map } from 'lucide-react';
import { BASE_MAPS, BaseMap } from '@/types/gis';
import { t } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface BaseMapSelectorProps {
  selectedBaseMap: string;
  onSelectBaseMap: (baseMapId: string) => void;
}

export function BaseMapSelector({ selectedBaseMap, onSelectBaseMap }: BaseMapSelectorProps) {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-sidebar-active" />
        <h3 className="font-semibold font-myanmar text-sidebar-foreground">{t.selectBaseMap}</h3>
      </div>

      {/* Base Map Options */}
      <div className="grid grid-cols-2 gap-2">
        {BASE_MAPS.map((baseMap) => (
          <button
            key={baseMap.id}
            onClick={() => onSelectBaseMap(baseMap.id)}
            className={cn(
              'p-3 rounded-lg border-2 transition-all duration-200 text-left',
              selectedBaseMap === baseMap.id
                ? 'border-sidebar-active bg-sidebar-active/10'
                : 'border-sidebar-border hover:border-sidebar-active/50 hover:bg-sidebar-hover'
            )}
          >
            <p className="text-sm font-medium text-sidebar-foreground">{baseMap.name}</p>
            <p className="text-xs text-muted-foreground font-myanmar mt-0.5">
              {baseMap.nameMyanmar}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
