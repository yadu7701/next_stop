import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { supabase, Route, Stop, Bus } from '../lib/supabase';
import { MapView } from '../components/MapView';

interface RouteTrackingProps {
  routeId: string;
  onBack: () => void;
}

export function RouteTracking({ routeId, onBack }: RouteTrackingProps) {
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);

  const scheduleBase = useMemo(() => new Date(), []);

  const getTimesForStop = (index: number) => {
    const scheduled = new Date(scheduleBase.getTime() + index * 6 * 60 * 1000);
    const delayMinutes = (index % 2 === 0 ? 2 : 0) + (index === 0 ? 0 : 1);
    const actual = new Date(scheduled.getTime() + delayMinutes * 60 * 1000);
    return { scheduled, actual, delayMinutes };
  };

  const fetchRouteData = useCallback(async () => {
    setLoading(true);
    try {
      const [routeRes, stopsRes, busesRes] = await Promise.all([
        supabase.from('routes').select('*').eq('id', routeId).maybeSingle(),
        supabase.from('stops').select('*').eq('route_id', routeId).order('sequence'),
        supabase.from('buses').select('*').eq('route_id', routeId),
      ]);

      if (routeRes.data) setRoute(routeRes.data);
      if (stopsRes.data) setStops(stopsRes.data);
      if (busesRes.data) setBuses(busesRes.data);
    } catch (error) {
      console.error('Error fetching route data:', error);
    } finally {
      setLoading(false);
    }
  }, [routeId]);

  useEffect(() => {
    fetchRouteData();
  }, [fetchRouteData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500">Route not found</div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-xl font-bold text-gray-900">{route.name}</h1>
            <p className="text-sm text-gray-600">{route.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 pt-20">
        <div className="h-1/2 relative">
          <MapView buses={buses} stops={stops} showRoute={true} />
        </div>

        <div className="h-1/2 bg-white overflow-y-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Route Stops</h2>
            <span className="text-sm text-gray-500">{stops.length} stops</span>
          </div>

          {stops.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No stops found</div>
          ) : (
            <div className="space-y-1">
              {stops.map((stop, index) => (
                <div
                  key={stop.id}
                  className="flex items-start gap-3 py-3 relative"
                >
                  {index < stops.length - 1 && (
                    <div className="absolute left-[15px] top-12 bottom-0 w-0.5 bg-blue-200" />
                  )}

                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 pt-1">
                    <h3 className="font-medium text-gray-900">{stop.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const { scheduled, actual, delayMinutes } = getTimesForStop(index);
                    return (
                      <div className="flex flex-col items-end text-xs w-24 text-right">
                        <span className="text-gray-800 font-semibold">
                          {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={delayMinutes > 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {actual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {delayMinutes > 0 && (
                          <span className="text-[10px] text-red-500">Delay: {delayMinutes} min</span>
                        )}
                      </div>
                    );
                  })()}

                  {index === 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      Start
                    </span>
                  )}
                  {index === stops.length - 1 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      End
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {buses.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Active Buses</h3>
              <div className="flex gap-2 flex-wrap">
                {buses.map((bus) => (
                  <span
                    key={bus.id}
                    className="px-3 py-1 bg-white text-blue-700 text-sm font-medium rounded-full shadow-sm"
                  >
                    {bus.number}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
