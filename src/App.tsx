import { lazy, Suspense, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { HomePage } from './pages/HomePage';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DisclaimerModal } from './components/DisclaimerModal';
import { InstallModal } from './components/InstallModal';
import { PatientProvider } from './context/PatientContext';

// Pagine secondarie caricate on-demand: ogni pagina diventa un chunk separato,
// ridotto sul first load. HomePage resta eager perché è la rotta iniziale.
const DrugsPage = lazy(() => import('./pages/DrugsPage').then(m => ({ default: m.DrugsPage })));
const DrugDetailPage = lazy(() => import('./pages/DrugDetailPage').then(m => ({ default: m.DrugDetailPage })));
const VitalSignsPage = lazy(() => import('./pages/VitalSignsPage').then(m => ({ default: m.VitalSignsPage })));
const DevicesPage = lazy(() => import('./pages/DevicesPage').then(m => ({ default: m.DevicesPage })));
const SummaryPage = lazy(() => import('./pages/SummaryPage').then(m => ({ default: m.SummaryPage })));
const GCSPage = lazy(() => import('./pages/GCSPage').then(m => ({ default: m.GCSPage })));
const VenturiPage = lazy(() => import('./pages/VenturiPage').then(m => ({ default: m.VenturiPage })));
const ETTPage = lazy(() => import('./pages/ETTPage').then(m => ({ default: m.ETTPage })));
const AntidotesPage = lazy(() => import('./pages/AntidotesPage').then(m => ({ default: m.AntidotesPage })));
const APGARPage = lazy(() => import('./pages/APGARPage').then(m => ({ default: m.APGARPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center" aria-label="Caricamento">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
    </div>
  );
}

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
  const [showInstall, setShowInstall] = useState(false);

  return (
    <PatientProvider>
    <div className="flex min-h-dvh flex-col bg-slate-50 pt-safe dark:bg-slate-950">
      <DisclaimerBanner onNavigate={setView} />

      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white pt-4 pb-safe-or-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p>
          PediCalc · Strumento educativo e formativo · Non sostituisce il giudizio clinico del
          professionista sanitario
        </p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="font-medium text-slate-400 dark:text-slate-500">Versione Beta 1.2</span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <button
            type="button"
            onClick={() => setShowDisclaimer(true)}
            className="font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
          >
            Disclaimer
          </button>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
          <button
            type="button"
            onClick={() => setShowInstall(true)}
            className="inline-flex items-center gap-1 font-medium text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5A.75.75 0 0 0 12 9Z" clipRule="evenodd" />
            </svg>
            Installa
          </button>
        </div>
      </footer>

      {showDisclaimer && <DisclaimerModal onClose={() => setShowDisclaimer(false)} />}
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}
      <Analytics />
    </div>
    </PatientProvider>
  );
}

export default App;
