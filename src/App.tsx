import { useState } from 'react';
import { HomePage } from './pages/HomePage';
import { DrugsPage } from './pages/DrugsPage';
import { DrugDetailPage } from './pages/DrugDetailPage';
import { VitalSignsPage } from './pages/VitalSignsPage';
import { DisclaimerBanner } from './components/DisclaimerBanner';

export type View =
  | { name: 'home' }
  | { name: 'drugs' }
  | { name: 'drug-detail'; drugId: string }
  | { name: 'vital-signs' };

function App() {
  const [view, setView] = useState<View>({ name: 'home' });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <DisclaimerBanner />

      <main className="flex-1">
        {view.name === 'home' && <HomePage onNavigate={setView} />}
        {view.name === 'drugs' && <DrugsPage onNavigate={setView} />}
        {view.name === 'drug-detail' && (
          <DrugDetailPage drugId={view.drugId} onNavigate={setView} />
        )}
        {view.name === 'vital-signs' && <VitalSignsPage onNavigate={setView} />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          PediCalc · Strumento educativo e formativo · Non sostituisce il giudizio clinico del
          professionista sanitario
        </p>
      </footer>
    </div>
  );
}

export default App;
