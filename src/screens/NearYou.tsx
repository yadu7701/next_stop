import { useEffect, useMemo, useState } from 'react';
import { MapView } from '../components/MapView';
import { Stop } from '../lib/supabase';

interface NearYouProps {
  onBack: () => void;
}

const FALLBACK_COORDS = { lat: 9.9312, lng: 76.2673 }; // Kochi

export function NearYou({ onBack }: NearYouProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    if (useMock) {
      setCoords(FALLBACK_COORDS);
      return;
    }

    if (!navigator.geolocation) {
      setCoords(FALLBACK_COORDS);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setCoords(FALLBACK_COORDS),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [useMock]);

  const center = useMemo(() => coords || FALLBACK_COORDS, [coords]);

  const mockStops: Stop[] = useMemo(
    () => [
      {
        id: 'mock-stop-1',
        route_id: 'mock-route',
        name: 'Kochi City Center',
        lat: 9.9312,
        lng: 76.2673,
        sequence: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-stop-2',
        route_id: 'mock-route',
        name: 'Marine Drive',
        lat: 9.9816,
        lng: 76.2767,
        sequence: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-stop-3',
        route_id: 'mock-route',
        name: 'Ernakulam South',
        lat: 9.9700,
        lng: 76.2900,
        sequence: 3,
        created_at: new Date().toISOString(),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <div>
          <p className="text-sm text-gray-500">Near you</p>
          <h1 className="text-xl font-bold text-gray-900">Live stops</h1>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="p-4 flex items-center gap-3 bg-white shadow-sm">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
          />
          Use mock location (Kochi)
        </label>
        <span className="text-xs text-gray-500">Current: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</span>
      </div>

      <div className="flex-1 p-4">
        <div className="h-full rounded-xl overflow-hidden shadow">
          <MapView center={center} stops={mockStops} />
        </div>
      </div>
    </div>
  );
}
