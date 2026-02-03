import { useEffect, useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { supabase, Bus, Route, Stop } from '../lib/supabase';
import { MapView } from '../components/MapView';

interface PassengerHomeProps {
  onBusSelect: (busId: string) => void;
  onMenuClick: () => void;
  onSeeAllStops: () => void;
  onSearchResults: (params: { from: string; to: string; busNumber?: string }) => void;
}

export function PassengerHome({ onBusSelect, onMenuClick, onSeeAllStops, onSearchResults }: PassengerHomeProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromValue, setFromValue] = useState('City Center');
  const [toValue, setToValue] = useState('Railway Station');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busesRes, routesRes, stopsRes] = await Promise.all([
        supabase.from('buses').select('*').order('number'),
        supabase.from('routes').select('*'),
        supabase.from('stops').select('*').order('sequence'),
      ]);

      if (busesRes.data) setBuses(busesRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
      if (stopsRes.data) setStops(stopsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockNearestBuses: Bus[] = [
    {
      id: 'mock-1',
      number: 'KL-07-101',
      route_id: routes[0]?.id ?? 'mock-route',
      current_lat: 0,
      current_lng: 0,
      status: 'on-time',
      next_stop_id: null,
      pollution_level: 'low',
      maintenance_status: 'ok',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      number: 'KL-07-202',
      route_id: routes[1]?.id ?? 'mock-route',
      current_lat: 0,
      current_lng: 0,
      status: 'delayed',
      next_stop_id: null,
      pollution_level: 'low',
      maintenance_status: 'ok',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      number: 'KL-07-303',
      route_id: routes[2]?.id ?? 'mock-route',
      current_lat: 0,
      current_lng: 0,
      status: 'overcrowded',
      next_stop_id: null,
      pollution_level: 'low',
      maintenance_status: 'ok',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    const fallback = { lat: 9.9312, lng: 76.2673 };
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setUserLocation(fallback);
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    );
  }, []);

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = toRadians(b.lat - a.lat);
    const dLon = toRadians(b.lng - a.lng);
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);
    const sinLat = Math.sin(dLat / 2);
    const sinLon = Math.sin(dLon / 2);
    const c = 2 * Math.atan2(
      Math.sqrt(sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon),
      Math.sqrt(1 - (sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon))
    );
    return R * c;
  };

  const nearestStop = userLocation
    ? stops.reduce<Stop | null>((closest, stop) => {
        if (!closest) return stop;
        const currentDist = distanceKm(userLocation, { lat: stop.lat, lng: stop.lng });
        const bestDist = distanceKm(userLocation, { lat: closest.lat, lng: closest.lng });
        return currentDist < bestDist ? stop : closest;
      }, null)
    : null;

  const getEtaMinutes = (bus: Bus) => {
    const seed = bus.number.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return (seed % 15) + 2;
  };

  const nearbyBusEntries = nearestStop
    ? buses
        .filter((bus) => bus.route_id === nearestStop.route_id)
        .map((bus) => ({ bus, eta: getEtaMinutes(bus) }))
        .sort((a, b) => a.eta - b.eta)
    : [];

  const fallbackEntries = mockNearestBuses.slice(0, 3).map((bus) => ({ bus, eta: getEtaMinutes(bus) }));
  const availableEntries = (nearbyBusEntries.length ? nearbyBusEntries : fallbackEntries).slice(0, 5);

  const getStatusLabel = (status: Bus['status']) => {
    if (status === 'on-time') return 'On Time';
    if (status === 'delayed') return 'Delayed';
    if (status === 'overcrowded') return 'Overcrowded';
    if (status === 'breakdown') return 'Breakdown';
    return status;
  };

  const getStatusColor = (status: Bus['status']) => {
    if (status === 'on-time') return 'bg-green-100 text-green-700';
    if (status === 'delayed') return 'bg-orange-100 text-orange-700';
    if (status === 'overcrowded') return 'bg-yellow-100 text-yellow-700';
    if (status === 'breakdown') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleFindBus = () => {
    onSearchResults({ from: fromValue, to: toValue });
  };

  const handleSearchBusNumber = () => {
    onSearchResults({ from: fromValue, to: toValue, busNumber: searchQuery });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Next Stop</h1>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-3">
                <div className="relative">
                  <span className="text-xs text-gray-500">From</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full" />
                      <div className="flex-1 w-px bg-gray-200" />
                    </div>
                    <input
                      value={fromValue}
                      onChange={(e) => setFromValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="relative">
                  <span className="text-xs text-gray-500">To</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 flex flex-col items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    </div>
                    <input
                      value={toValue}
                      onChange={(e) => setToValue(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setFromValue(toValue);
                  setToValue(fromValue);
                }}
                className="mt-6 w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center shadow-sm bg-white hover:bg-gray-50"
                aria-label="Swap"
              >
                <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 1 21 5 17 9" />
                  <line x1="3" y1="5" x2="21" y2="5" />
                  <polyline points="7 15 3 19 7 23" />
                  <line x1="3" y1="19" x2="21" y2="19" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <button
                onClick={handleFindBus}
                className="w-full block py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm md:text-base shadow-sm"
              >
                Find Bus
              </button>
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bus number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-2">
              <button
                onClick={handleSearchBusNumber}
                className="w-full block py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm md:text-base shadow-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 pt-[240px]">
        <div className="h-[42vh] relative px-4">
          <div className="h-full rounded-2xl overflow-hidden shadow-lg">
            <MapView buses={buses} stops={stops} />
          </div>
        </div>

        <div className="bg-gray-50 overflow-y-auto px-4 py-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nearest bus stop</p>
                <h3 className="text-lg font-semibold text-gray-900">Ernakulam</h3>
              </div>
              <button onClick={onSeeAllStops} className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1">
                See all stops
                <span aria-hidden>→</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">⏱</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">Ernakulam</p>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    🚶 1 min away
                  </span>
                </div>
                <p className="text-sm text-gray-700">To Kottarakkara Bus Stand</p>
                <p className="text-xs text-gray-500">04:43 AM</p>
                <p className="text-xs text-gray-500 mt-1">Via: Kasaragodu, Kozhikkodu, Tirur, Thrissur, Angamali</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Current Available Buses Near You</h2>
            {loading && buses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading buses...</div>
            ) : availableEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No buses nearby</div>
            ) : (
              <div className="space-y-3">
                {availableEntries.map(({ bus, eta }) => {
                  const route = routes.find((r) => r.id === bus.route_id);
                  const estMinutes = eta;
                  return (
                    <div key={bus.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-sm p-3 border border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">🚌</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{bus.number}</p>
                          {route && <span className="text-xs text-gray-500">{route.name}</span>}
                        </div>
                        <p className="text-xs text-gray-500">ETA: {estMinutes} min</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bus.status)}`}>
                        {getStatusLabel(bus.status)}
                      </span>
                      <button
                        className="text-sm text-blue-600 font-semibold hover:underline"
                        onClick={() => onBusSelect(bus.id)}
                      >
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
