import { useState } from 'react';
import { X, User, Shield } from 'lucide-react';
import { PassengerHome } from './screens/PassengerHome';
import { BusDetails } from './screens/BusDetails';
import { RouteTracking } from './screens/RouteTracking';
import { AdminMonitor } from './screens/AdminMonitor';
import { NearYou } from './screens/NearYou';
import { Results } from './screens/Results';

type Screen =
  | { type: 'passenger-home' }
  | { type: 'bus-details'; busId: string }
  | { type: 'route-tracking'; routeId: string }
  | { type: 'near-you' }
  | { type: 'results'; params: { from: string; to: string; busNumber?: string } }
  | { type: 'admin-monitor' };

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'passenger-home' });
  const [menuOpen, setMenuOpen] = useState(false);

  const navigateToBusDetails = (busId: string) => {
    setCurrentScreen({ type: 'bus-details', busId });
  };

  const navigateToRouteTracking = (routeId: string) => {
    setCurrentScreen({ type: 'route-tracking', routeId });
  };

  const navigateToResults = (params: { from: string; to: string; busNumber?: string }) => {
    setCurrentScreen({ type: 'results', params });
  };

  const navigateToNearYou = () => {
    setCurrentScreen({ type: 'near-you' });
  };

  const navigateToAdminMonitor = () => {
    setCurrentScreen({ type: 'admin-monitor' });
    setMenuOpen(false);
  };

  const navigateToHome = () => {
    setCurrentScreen({ type: 'passenger-home' });
  };

  const renderScreen = () => {
    switch (currentScreen.type) {
      case 'passenger-home':
        return (
          <PassengerHome
            onBusSelect={navigateToBusDetails}
            onMenuClick={() => setMenuOpen(true)}
            onSeeAllStops={navigateToNearYou}
            onSearchResults={navigateToResults}
          />
        );
      case 'bus-details':
        return (
          <BusDetails
            busId={currentScreen.busId}
            onBack={navigateToHome}
            onViewRoute={navigateToRouteTracking}
          />
        );
      case 'route-tracking':
        return (
          <RouteTracking
            routeId={currentScreen.routeId}
            onBack={() => setCurrentScreen({ type: 'passenger-home' })}
          />
        );
      case 'admin-monitor':
        return (
          <AdminMonitor
            onBack={navigateToHome}
          />
        );
      case 'near-you':
        return (
          <NearYou
            onBack={navigateToHome}
          />
        );
      case 'results':
        return (
          <Results
            params={currentScreen.params}
            onBack={navigateToHome}
          />
        );
    }
  };

  return (
    <>
      {renderScreen()}

      {menuOpen && (
        <div className="fixed inset-0 z-[2000]">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Next Stop</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-700" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Bus Monitoring System</p>
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  navigateToHome();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Passenger View</p>
                  <p className="text-sm text-gray-600">Track buses and routes</p>
                </div>
              </button>

              <button
                onClick={navigateToAdminMonitor}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <Shield className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-gray-900">Admin Monitor</p>
                  <p className="text-sm text-gray-600">Fleet management</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
