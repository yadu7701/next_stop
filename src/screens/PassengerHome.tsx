import { useEffect, useState } from 'react';
import { Search, Menu } from 'lucide-react';
import { supabase, Bus, Route, Stop } from '../lib/supabase';
import { MapView } from '../components/MapView';
import { BusCard } from '../components/BusCard';

interface PassengerHomeProps {
  onBusSelect: (busId: string) => void;
  onMenuClick: () => void;
}

export function PassengerHome({ onBusSelect, onMenuClick }: PassengerHomeProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredBuses = buses.filter((bus) =>
    bus.number.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bus number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 pt-32">
        <div className="h-1/2 relative">
          <MapView buses={buses} stops={stops} />
        </div>

        <div className="h-1/2 bg-gray-50 overflow-y-auto px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Buses</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading buses...</div>
          ) : filteredBuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No buses found</div>
          ) : (
            <div className="space-y-3">
              {filteredBuses.map((bus) => {
                const route = routes.find((r) => r.id === bus.route_id);
                const nextStop = stops.find((s) => s.id === bus.next_stop_id);
                return (
                  <BusCard
                    key={bus.id}
                    bus={bus}
                    route={route}
                    nextStop={nextStop}
                    onClick={() => onBusSelect(bus.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
