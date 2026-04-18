import { useMemo } from 'react';
import type { View } from '../App';
import { calculateVitalSigns, VitalSignsError } from '../lib/vitalSigns';
import type { VitalSignsResult } from '../lib/vitalSigns';
import { usePatient } from '../context/PatientContext';
import { PatientChip } from '../components/PatientChip';

interface VitalSignsPageProps {
  onNavigate: (view: View) => void;
}

export function VitalSignsPage({ onNavigate }: VitalSignsPageProps) {
  const { age: value, setAge: setValue, ageUnit: unit, setAgeUnit: setUnit } = usePatient();

  const { result, error } = useMemo<{
    result: VitalSignsResult | null;
    error: string | null;
  }>(() => {
    const v = parseFloat(value);
    if (!Number.isFinite(v) || v < 0) return { result: null, error: null };
    try {
      return { result: calculateVitalSigns({ value: v, unit }), error: null };
    } catch (e) {
      if (e instanceof VitalSignsError) return { result: null, error: e.message };
      return { result: null, error: 'Errore nel calcolo' };
    }
  }, [value, unit]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'home' })}
          className="btn-ghost inline-flex items-center gap-1.5"
        >
          <span aria-hidden="true">←</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
            <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.432Z" />
          </svg>
          Home
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Parametri vitali</h1>
        <PatientChip />
      </div>

      <div className="card">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Inserisci l'età del paziente per ottenere i range di riferimento di frequenza
          respiratoria, frequenza cardiaca e pressione arteriosa.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="age-value" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Età
            </label>
            <input
              id="age-value"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input-field"
              placeholder="Es. 4"
            />
          </div>
          <div>
            <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Unità
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnit('anni')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  unit === 'anni'
                    ? 'pill-selected'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                }`}
              >
                Anni
              </button>
              <button
                type="button"
                onClick={() => setUnit('mesi')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  unit === 'mesi'
                    ? 'pill-selected'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                }`}
              >
                Mesi
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5 dark:border-rose-800 dark:bg-rose-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
              Fascia d'età: {result.ageRangeLabel}
            </p>
            <dl className="mt-4 space-y-3">
              <Row label="Frequenza respiratoria" value={result.respiratoryRate} />
              <Row label="Frequenza cardiaca" value={result.heartRate} />
              <Row label="PA sistolica minima" value={result.systolicBPMin} />
              <Row label="PA sistolica (range)" value={result.systolicBPRange} />
              <div className="flex items-baseline justify-between gap-4 pt-2 border-t border-rose-200/60 dark:border-rose-800/60">
                <dt className="text-sm font-medium text-rose-900/80 dark:text-rose-200/80">
                  SpO<sub>2</sub>
                </dt>
                <dd className="text-right text-sm font-bold text-amber-700 dark:text-amber-400">
                  {result.spo2Alert}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* Pulsante GCS */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-700/60 pt-5">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'gcs' })}
            className="group flex w-full items-center justify-between rounded-2xl border-2 border-violet-200 bg-violet-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-violet-700 dark:bg-violet-950/30"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-500 dark:text-violet-400">
                Strumento
              </p>
              <p className="text-base font-bold text-violet-900 dark:text-violet-100">
                GCS Pediatrico
              </p>
              <p className="text-xs text-violet-700/70 dark:text-violet-300/70">
                Glasgow Coma Scale modificata per lattanti e bambini
              </p>
            </div>
            <span className="text-2xl text-violet-500 dark:text-violet-400 transition group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Pulsante APGAR */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'apgar' })}
            className="group flex w-full items-center justify-between rounded-2xl border-2 border-pink-200 bg-pink-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-pink-700 dark:bg-pink-950/30"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-pink-500 dark:text-pink-400">
                Strumento
              </p>
              <p className="text-base font-bold text-pink-900 dark:text-pink-100">
                Indice di APGAR
              </p>
              <p className="text-xs text-pink-700/70 dark:text-pink-300/70">
                Valutazione del neonato a 1' e 5' dalla nascita
              </p>
            </div>
            <span className="text-2xl text-pink-500 dark:text-pink-400 transition group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rose-200/60 pb-2 last:border-b-0 last:pb-0 dark:border-rose-800/60">
      <dt className="text-sm font-medium text-rose-900/80 dark:text-rose-200/80">{label}</dt>
      <dd className="text-right text-base font-bold text-rose-900 dark:text-rose-100">{value}</dd>
    </div>
  );
}
