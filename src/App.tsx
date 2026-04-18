import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { DrugsPage } from './pages/DrugsPage';
import { DrugDetailPage } from './pages/DrugDetailPage';
import { VitalSignsPage } from './pages/VitalSignsPage';
import { DevicesPage } from './pages/DevicesPage';
import { SummaryPage } from './pages/SummaryPage';
import { GCSPage } from './pages/GCSPage';
import { VenturiPage } from './pages/VenturiPage';
import { ETTPage } from './pages/ETTPage';
import { AntidotesPage } from './pages/AntidotesPage';
import { APGARPage } from './pages/APGARPage';
import { AboutPage } from './pages/AboutPage';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DisclaimerModal } from './components/DisclaimerModal';
import { PatientProvider } from './context/PatientContext';

export type View =
  | { name: 'home' }
  | { name: 'summary' }
  | { name: 'drugs' }
  | { name: 'drug-detail'; drugId: string }
  | { name: 'vital-signs' }
  | { name: 'gcs' }
  | { name: 'apgar' }
  | { name: 'devices' }
  | { name: 'venturi' }
  | { name: 'ett' }
  | { name: 'antidotes' }
  | { name: 'about' };

function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <PatientProvider>
    <div className="flex min-h-dvh flex-col bg-slate-50 pt-safe dark:bg-slate-950">
      <DisclaimerBanner onNavigate={setView} />

      <main className="flex-1">
        {view.name === 'home' && <HomePage onNavigate={setView} />}
        {view.name === 'summary' && <SummaryPage onNavigate={setView} />}
        {view.name === 'drugs' && <DrugsPage onNavigate={setView} />}
        {view.name === 'drug-detail' && (
          <DrugDetailPage drugId={view.drugId} onNavigate={setView} />
        )}
        {view.name === 'vital-signs' && <VitalSignsPage onNavigate={setView} />}
        {view.name === 'gcs' && <GCSPage onNavigate={setView} />}
        {view.name === 'apgar' && <APGARPage onNavigate={setView} />}
        {view.name === 'devices' && <DevicesPage onNavigate={setView} />}
        {view.name === 'venturi' && <VenturiPage onNavigate={setView} />}
        {view.name === 'ett' && <ETTPage onNavigate={setView} />}
        {view.name === 'antidotes' && <AntidotesPage onNavigate={setView} />}
        {view.name === 'about' && <AboutPage onNavigate={setView} />}
      </main>

      <footer className="border-t border-slate-200 bg-white pt-4 pb-safe-or-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p>
          PediCalc · Strumento educativo e formativo · Non sostituisce il giudizio clinico del
          professionista sanitario
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-medium text-slate-400 dark:text-slate-500">Versione Beta 1.1</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <button
            type="button"
            onClick={() => setShowDisclaimer(true)}
            className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
          >
            Disclaimer
          </button>
        </div>
      </footer>

      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}
    </div>
    </PatientProvider>
  );
}

export default App;
