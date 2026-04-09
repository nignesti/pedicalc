import { useMemo, useState } from 'react';
import type { View } from '../App';
import { calculateVitalSigns, VitalSignsError } from '../lib/vitalSigns';
import type { AgeUnit, VitalSignsResult } from '../lib/vitalSigns';

interface VitalSignsPageProps {
  onNavigate: (view: View) => void;
}

export function VitalSignsPage({ onNavigate }: VitalSignsPageProps) {
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<AgeUnit>('anni');

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
          className="btn-ghost"
        >
          ← Home
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Parametri vitali</h1>
        <div className="w-16" />
      </div>

      <div className="card">
        <p className="text-sm text-slate-600">
          Inserisci l'età del paziente per ottenere i range di riferimento di frequenza
          respiratoria, frequenza cardiaca e pressione arteriosa.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="age-value" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
              autoFocus
            />
          </div>
          <div>
            <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Unità
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUnit('anni')}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  unit === 'anni'
                    ? 'pill-selected'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
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
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                Mesi
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 rounded-2xl border-2 border-rose-200 bg-rose-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Fascia d'età: {result.ageRangeLabel}
            </p>
            <dl className="mt-4 space-y-3">
              <Row label="Frequenza respiratoria" value={result.respiratoryRate} />
              <Row label="Frequenza cardiaca" value={result.heartRate} />
              <Row label="PA sistolica minima" value={result.systolicBPMin} />
              <Row label="PA sistolica (range)" value={result.systolicBPRange} />
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rose-200/60 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-sm font-medium text-rose-900/80">{label}</dt>
      <dd className="text-right text-base font-bold text-rose-900">{value}</dd>
    </div>
  );
}
