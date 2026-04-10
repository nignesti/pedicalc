import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { DrugsPage } from './pages/DrugsPage';
import { DrugDetailPage } from './pages/DrugDetailPage';
import { VitalSignsPage } from './pages/VitalSignsPage';
import { DevicesPage } from './pages/DevicesPage';
import { SummaryPage } from './pages/SummaryPage';
import { GCSPage } from './pages/GCSPage';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { PatientProvider } from './context/PatientContext';

export type View =
  | { name: 'home' }
  | { name: 'summary' }
  | { name: 'drugs' }
  | { name: 'drug-detail'; drugId: string }
  | { name: 'vital-signs' }
  | { name: 'gcs' }
  | { name: 'devices' };

function App() {
  const [view, setView] = useState<View>({ name: 'home' });

  return (
    <PatientProvider>
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <DisclaimerBanner />

      <main className="flex-1">
        {view.name === 'home' && <HomePage onNavigate={setView} />}
        {view.name === 'summary' && <SummaryPage onNavigate={setView} />}
        {view.name === 'drugs' && <DrugsPage onNavigate={setView} />}
        {view.name === 'drug-detail' && (
          <DrugDetailPage drugId={view.drugId} onNavigate={setView} />
        )}
        {view.name === 'vital-signs' && <VitalSignsPage onNavigate={setView} />}
        {view.name === 'gcs' && <GCSPage onNavigate={setView} />}
        {view.name === 'devices' && <DevicesPage onNavigate={setView} />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p>
          PediCalc · Strumento educativo e formativo · Non sostituisce il giudizio clinico del
          professionista sanitario
        </p>
      </footer>
    </div>
    </PatientProvider>
  );
}

export default App;
