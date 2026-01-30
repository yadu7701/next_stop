import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Clock, Navigation } from 'lucide-react';
import { supabase, Bus, Route, Stop } from '../lib/supabase';
import { MapView } from '../components/MapView';
import { StatusBadge } from '../components/StatusBadge';

interface BusDetailsProps {
  busId: string;
  onBack: () => void;
  onViewRoute: (routeId: string) => void;
}

export function BusDetails({ busId, onBack, onViewRoute }: BusDetailsProps) {
  const [bus, setBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [nextStop, setNextStop] = useState<Stop | null>(null);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBusDetails = useCallback(async () => {
    setLoading(true);
    try {
      const { data: busData } = await supabase
        .from('buses')
        .select('*')
        .eq('id', busId)
        .maybeSingle();

      if (busData) {
        setBus(busData);

        const [routeRes, stopRes, allStopsRes] = await Promise.all([
          supabase.from('routes').select('*').eq('id', busData.route_id).maybeSingle(),
          busData.next_stop_id
            ? supabase.from('stops').select('*').eq('id', busData.next_stop_id).maybeSingle()
            : Promise.resolve({ data: null }),
          supabase.from('stops').select('*').eq('route_id', busData.route_id).order('sequence'),
        ]);

        if (routeRes.data) setRoute(routeRes.data);
        if (stopRes.data) setNextStop(stopRes.data);
        if (allStopsRes.data) setAllStops(allStopsRes.data);
      }
    } catch (error) {
      console.error('Error fetching bus details:', error);
    } finally {
      setLoading(false);
    }
  }, [busId]);

  useEffect(() => {
    fetchBusDetails();
  }, [fetchBusDetails]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Bus not found</div>
      </div>
    );
  }

  const estimatedTime = Math.floor(Math.random() * 15) + 2;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">{bus.number}</h1>
        </div>
      </div>

      <div className="flex-1 pt-16">
        <div className="h-1/2 relative">
          <MapView buses={[bus]} stops={allStops} selectedBusId={bus.id} />
        </div>

        <div className="h-1/2 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status</h2>
                <StatusBadge status={bus.status} type="bus" />
              </div>

              {route && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Route</p>
                      <p className="font-medium text-gray-900">{route.name}</p>
                      <p className="text-sm text-gray-500">{route.description}</p>
                    </div>
                  </div>

                  {nextStop && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Next Stop</p>
                          <p className="font-medium text-gray-900">{nextStop.name}</p>
                          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Arriving in {estimatedTime} minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => route && onViewRoute(route.id)}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    View Full Route
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Bus Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Pollution Level</span>
                  <StatusBadge status={bus.pollution_level} type="pollution" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maintenance Status</span>
                  <StatusBadge status={bus.maintenance_status} type="maintenance" />
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date(bus.updated_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
