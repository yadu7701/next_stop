import { useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { Bus, Stop } from '../lib/supabase';

interface MapViewProps {
  buses?: Bus[];
  stops?: Stop[];
  center?: { lat: number; lng: number };
  showRoute?: boolean;
  selectedBusId?: string;
}

export function MapView({ buses = [], stops = [], center, showRoute = false, selectedBusId }: MapViewProps) {
  const defaultCenter = useMemo<[number, number]>(() => [9.5916, 76.5222], []);

  const resolvedCenter = useMemo<[number, number]>(() => {
    if (center) return [center.lat, center.lng];
    if (stops.length > 0) return [stops[0].lat, stops[0].lng];
    if (buses.length > 0) return [buses[0].current_lat, buses[0].current_lng];
    return defaultCenter;
  }, [center, stops, buses, defaultCenter]);

  const centerKey = `${resolvedCenter[0]}-${resolvedCenter[1]}`;

  const routePath = useMemo<LatLngExpression[]>(
    () => stops.map((stop) => [stop.lat, stop.lng]),
    [stops],
  );

  const getBusColor = (status: string) => {
    switch (status) {
      case 'on-time': return '#10B981';
      case 'delayed': return '#F59E0B';
      case 'overcrowded': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key={centerKey}
        center={resolvedCenter}
        zoom={13}
        scrollWheelZoom
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="rounded-xl overflow-hidden shadow-inner leaflet-parent"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />

        {showRoute && routePath.length > 0 && (
          <Polyline
            positions={routePath}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.9 }}
          />
        )}

        {stops.map((stop) => (
          <CircleMarker
            key={stop.id}
            center={[stop.lat, stop.lng]}
            radius={8}
            pathOptions={{ color: '#1D4ED8', fillColor: '#2563EB', fillOpacity: 0.9, weight: 2 }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              <span className="text-xs font-semibold text-blue-900">{stop.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}

        {buses.map((bus) => {
          const isSelected = selectedBusId === bus.id;
          return (
            <CircleMarker
              key={bus.id}
              center={[bus.current_lat, bus.current_lng]}
              radius={isSelected ? 12 : 10}
              pathOptions={{
                color: '#ffffff',
                weight: isSelected ? 3 : 2,
                fillColor: getBusColor(bus.status),
                fillOpacity: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1} permanent>
                <div className="text-xs font-semibold text-gray-800">{bus.number}</div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>On Time</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Overcrowded</span>
        </div>
      </div>
    </div>
  );
}
