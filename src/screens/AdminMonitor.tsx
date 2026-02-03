import { useEffect, useState } from 'react';
import { ArrowLeft, Bus as BusIcon, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, Bus, Route } from '../lib/supabase';
import { StatusBadge } from '../components/StatusBadge';

interface AdminMonitorProps {
  onBack: () => void;
}

export function AdminMonitor({ onBack }: AdminMonitorProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'needs-attention'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [formBusNumber, setFormBusNumber] = useState('');
  const [formRouteId, setFormRouteId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [busesRes, routesRes] = await Promise.all([
        supabase.from('buses').select('*').order('number'),
        supabase.from('routes').select('*'),
      ]);

      if (busesRes.data) setBuses(busesRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuses = buses.filter((bus) => {
    if (filter === 'needs-attention') {
      return bus.pollution_level === 'high' || bus.maintenance_status === 'needs-service';
    }
    return true;
  });

  const needsAttentionCount = buses.filter(
    (bus) => bus.pollution_level === 'high' || bus.maintenance_status === 'needs-service'
  ).length;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Monitor</h1>
            <p className="text-sm text-gray-600">Bus fleet management</p>
          </div>
        </div>
        <div className="px-4 pb-3 flex items-center gap-3">
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Buses ({buses.length})
            </button>
            <button
              onClick={() => setFilter('needs-attention')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'needs-attention'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Needs Attention ({needsAttentionCount})
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFormBusNumber('');
                setFormRouteId(routes[0]?.id ?? '');
                setShowAddForm(true);
                setShowRemoveForm(false);
              }}
              className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Add
            </button>
            <button
              onClick={() => {
                setFormBusNumber('');
                setShowRemoveForm(true);
                setShowAddForm(false);
              }}
              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading buses...</div>
        ) : filteredBuses.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">All buses are running smoothly</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuses.map((bus) => {
              const route = routes.find((r) => r.id === bus.route_id);
              const hasIssues = bus.pollution_level === 'high' || bus.maintenance_status === 'needs-service';

              return (
                <div
                  key={bus.id}
                  className={`bg-white rounded-xl shadow-md p-4 ${
                    hasIssues ? 'border-2 border-red-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        hasIssues ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        <BusIcon className={`w-6 h-6 ${
                          hasIssues ? 'text-red-600' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{bus.number}</h3>
                        {hasIssues && (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      {route && (
                        <p className="text-sm text-gray-600 mb-3">{route.name}</p>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Pollution Level</span>
                          <StatusBadge status={bus.pollution_level} type="pollution" />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Maintenance</span>
                          <StatusBadge status={bus.maintenance_status} type="maintenance" />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">Status</span>
                          <StatusBadge status={bus.status} type="bus" />
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Last updated: {new Date(bus.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(showAddForm || showRemoveForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{showAddForm ? 'Add Bus' : 'Remove Bus'}</h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowRemoveForm(false);
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Bus Number</label>
                <input
                  value={formBusNumber}
                  onChange={(e) => setFormBusNumber(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g., KL-07-999"
                />
              </div>
              {showAddForm && (
                <div>
                  <label className="text-sm text-gray-700">Route</label>
                  <select
                    value={formRouteId}
                    onChange={(e) => setFormRouteId(e.target.value)}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setShowRemoveForm(false);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              {showAddForm ? (
                <button
                  onClick={() => {
                    if (!formBusNumber || !formRouteId) return;
                    const now = new Date().toISOString();
                    const newBus: Bus = {
                      id: `mock-${Date.now()}`,
                      number: formBusNumber,
                      route_id: formRouteId,
                      current_lat: 0,
                      current_lng: 0,
                      status: 'on-time',
                      next_stop_id: null,
                      pollution_level: 'low',
                      maintenance_status: 'ok',
                      updated_at: now,
                      created_at: now,
                    };
                    setBuses((prev) => [...prev, newBus]);
                    setShowAddForm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!formBusNumber) return;
                    setBuses((prev) => prev.filter((b) => b.number !== formBusNumber));
                    setShowRemoveForm(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-600">Total Buses: </span>
              <span className="font-semibold text-gray-900">{buses.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Operational: </span>
              <span className="font-semibold text-green-600">
                {buses.filter((b) => b.maintenance_status === 'ok').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
