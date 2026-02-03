import { useMemo, useState } from 'react';

type Status = 'on-time' | 'delayed' | 'overcrowded' | 'breakdown';

interface ResultsProps {
  params: { from: string; to: string; busNumber?: string };
  onBack: () => void;
}

interface ResultItem {
  id: string;
  busNumber: string;
  routeFrom: string;
  routeTo: string;
  startTime: string;
  endTime: string;
  eta: string;
  status: Status;
}

const statusStyles: Record<Status, string> = {
  'on-time': 'bg-green-100 text-green-700',
  delayed: 'bg-orange-100 text-orange-700',
  overcrowded: 'bg-yellow-100 text-yellow-800',
  breakdown: 'bg-red-100 text-red-700',
};

const statusLabels: Record<Status, string> = {
  'on-time': 'On Time',
  delayed: 'Delayed',
  overcrowded: 'Overcrowded',
  breakdown: 'Breakdown',
};

const mockData: ResultItem[] = [
  {
    id: 'r1',
    busNumber: 'KL-07-101',
    routeFrom: 'City Center',
    routeTo: 'Railway Station',
    startTime: '06:15',
    endTime: '07:10',
    eta: '12 min',
    status: 'on-time',
  },
  {
    id: 'r2',
    busNumber: 'KL-07-202',
    routeFrom: 'City Center',
    routeTo: 'Railway Station',
    startTime: '06:45',
    endTime: '07:40',
    eta: '24 min',
    status: 'delayed',
  },
  {
    id: 'r3',
    busNumber: 'KL-07-303',
    routeFrom: 'City Center',
    routeTo: 'Railway Station',
    startTime: '07:10',
    endTime: '08:00',
    eta: '35 min',
    status: 'overcrowded',
  },
  {
    id: 'r4',
    busNumber: 'KL-07-404',
    routeFrom: 'City Center',
    routeTo: 'Railway Station',
    startTime: '07:30',
    endTime: '08:25',
    eta: '48 min',
    status: 'breakdown',
  },
];

export function Results({ params, onBack }: ResultsProps) {
  const [dayOffset, setDayOffset] = useState(0);

  const dateLabel = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }, [dayOffset]);

  const filtered = useMemo(() => {
    const byRoute = mockData.filter(
      (item) =>
        item.routeFrom.toLowerCase().includes(params.from.toLowerCase()) &&
        item.routeTo.toLowerCase().includes(params.to.toLowerCase())
    );
    if (!params.busNumber) return byRoute;
    const term = params.busNumber.toLowerCase();
    return byRoute.filter((item) => item.busNumber.toLowerCase().includes(term));
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 border border-gray-200"
          aria-label="Back"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Results</h1>
          <p className="text-sm text-gray-600">
            {params.from} → {params.to}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setDayOffset((d) => d - 1)}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            Previous Day
          </button>
          <span className="text-sm font-semibold text-gray-800">{dateLabel}</span>
          <button
            onClick={() => setDayOffset((d) => d + 1)}
            className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            Next Day
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{item.busNumber}</span>
                  <span className="text-sm text-gray-600">
                    {item.routeFrom} → {item.routeTo}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>
                  {item.startTime} → {item.endTime}
                </span>
                <span className="text-gray-900 font-medium">ETA {item.eta}</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center text-gray-600">
              No buses found for this day.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
