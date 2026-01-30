import { Bus as BusIcon, Clock } from 'lucide-react';
import { Bus, Route, Stop } from '../lib/supabase';
import { StatusBadge } from './StatusBadge';

interface BusCardProps {
  bus: Bus;
  route?: Route;
  nextStop?: Stop;
  onClick?: () => void;
  showDetails?: boolean;
}

export function BusCard({ bus, route, nextStop, onClick, showDetails = false }: BusCardProps) {
  const estimatedTime = Math.floor(Math.random() * 15) + 2;

  return (
    <div
      className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
            <BusIcon className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{bus.number}</h3>
            <StatusBadge status={bus.status} type="bus" />
          </div>

          {route && (
            <p className="text-sm text-gray-600 mb-2">{route.name}</p>
          )}

          {nextStop && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime} min to {nextStop.name}</span>
            </div>
          )}

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pollution Level:</span>
                <StatusBadge status={bus.pollution_level} type="pollution" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Maintenance:</span>
                <StatusBadge status={bus.maintenance_status} type="maintenance" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
