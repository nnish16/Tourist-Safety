import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TouristPWA from './components/TouristPWA';
import Documentation from './components/Documentation';
import { AppView, Tourist, AnomalyEvent } from './types';
import { INITIAL_TOURISTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [tourists, setTourists] = useState<Tourist[]>(INITIAL_TOURISTS);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>([]);

  // Handler to update a specific tourist's state from the PWA simulation
  const handleTouristUpdate = (updatedTourist: Tourist) => {
    setTourists(prev => prev.map(t => t.id === updatedTourist.id ? updatedTourist : t));
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard tourists={tourists} anomalies={anomalies} setAnomalies={setAnomalies} />;
      case AppView.PWA:
        // For simulation, we just show the first tourist's view
        return (
          <div className="p-6 md:p-12 flex items-center justify-center min-h-full bg-slate-100">
             <TouristPWA tourist={tourists[0]} onUpdate={handleTouristUpdate} />
             <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg text-xs max-w-xs border border-slate-200 hidden md:block">
                <p className="font-bold mb-1">Simulation Note:</p>
                <p>This view simulates the PWA running on "Alice's" phone. Interactions here update the Dashboard in real-time.</p>
             </div>
          </div>
        );
      case AppView.DOCS:
        return <Documentation />;
      default:
        return <Dashboard tourists={tourists} anomalies={anomalies} setAnomalies={setAnomalies} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;