import { useEffect, useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { supabase, Bus, Route, Stop } from '../lib/supabase';
import { MapView } from '../components/MapView';

interface PassengerHomeProps {
  onBusSelect: (busId: string) => void;
  onMenuClick: () => void;
  onSeeAllStops: () => void;
}

export function PassengerHome({ onBusSelect, onMenuClick, onSeeAllStops }: PassengerHomeProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fromValue, setFromValue] = useState('City Center');
  const [toValue, setToValue] = useState('Railway Station');

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

  const filteredBuses = buses.filter((bus) => {
    const matchesNumber = bus.number.toLowerCase().includes(searchQuery.toLowerCase());
    const route = routes.find((r) => r.id === bus.route_id);

    const norm = (value: string) => value.trim().toLowerCase();
    const from = norm(fromValue);
    const to = norm(toValue);

    const matchesRoute = (() => {
      if (!route) return true;
      const name = route.name.toLowerCase();
      if (from && to) return name.includes(from) && name.includes(to);
      if (from) return name.includes(from);
      if (to) return name.includes(to);
      return true;
    })();

    return matchesNumber && matchesRoute;
  });

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
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Buses</h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading buses...</div>
            ) : filteredBuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No buses found</div>
            ) : (
              <div className="space-y-3">
                {filteredBuses.map((bus) => {
                  const route = routes.find((r) => r.id === bus.route_id);
                  const estMinutes = Math.max(2, Math.floor(Math.random() * 15) + 2);
                  const statusLabel = bus.status === 'on-time' ? 'On Time' : bus.status === 'delayed' ? 'Delayed' : 'Overcrowded';
                  const statusColor = bus.status === 'on-time' ? 'bg-green-100 text-green-700' : bus.status === 'delayed' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
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
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{statusLabel}</span>
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
