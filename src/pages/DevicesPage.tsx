import { useMemo, useState } from 'react';
import type { View } from '../App';
import { findBand, DeviceSelectorError } from '../lib/deviceSelector';
import type { DeviceBand, FasciaColor } from '../data/devices';
import { usePatient } from '../context/PatientContext';

interface DevicesPageProps {
  onNavigate: (view: View) => void;
}

type InputMode = 'age' | 'weight' | 'height';

/** Classi Tailwind per la banda colorata di ciascuna fascia */
const bandStyles: Record<FasciaColor, { bg: string; text: string; border: string }> = {
  rosso: {
    bg: 'bg-red-100 dark:bg-red-950/40',
    text: 'text-red-900 dark:text-red-200',
    border: 'border-red-300 dark:border-red-800',
  },
  giallo: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/40',
    text: 'text-yellow-900 dark:text-yellow-200',
    border: 'border-yellow-300 dark:border-yellow-800',
  },
  verde: {
    bg: 'bg-green-100 dark:bg-green-950/40',
    text: 'text-green-900 dark:text-green-200',
    border: 'border-green-300 dark:border-green-800',
  },
  arancione: {
    bg: 'bg-orange-100 dark:bg-orange-950/40',
    text: 'text-orange-900 dark:text-orange-200',
    border: 'border-orange-300 dark:border-orange-800',
  },
  viola: {
    bg: 'bg-purple-100 dark:bg-purple-950/40',
    text: 'text-purple-900 dark:text-purple-200',
    border: 'border-purple-300 dark:border-purple-800',
  },
  bianco: {
    bg: 'bg-slate-50 dark:bg-slate-800/60',
    text: 'text-slate-900 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-600',
  },
};

export function DevicesPage({ onNavigate }: DevicesPageProps) {
  const [mode, setMode] = useState<InputMode>('weight');
  const [height, setHeight] = useState('');
  const { weight, setWeight, age: ageValue, setAge: setAgeValue, ageUnit, setAgeUnit } = usePatient();

  const { band, error } = useMemo<{
    band: DeviceBand | null;
    error: string | null;
  }>(() => {
    try {
      if (mode === 'age') {
        const v = parseFloat(ageValue);
        if (!Number.isFinite(v) || v <= 0) return { band: null, error: null };
        return { band: findBand({ kind: 'age', value: v, unit: ageUnit }), error: null };
      }
      if (mode === 'weight') {
        const v = parseFloat(weight);
        if (!Number.isFinite(v) || v <= 0) return { band: null, error: null };
        return { band: findBand({ kind: 'weight', kg: v }), error: null };
      }
      const v = parseFloat(height);
      if (!Number.isFinite(v) || v <= 0) return { band: null, error: null };
      return { band: findBand({ kind: 'height', cm: v }), error: null };
    } catch (e) {
      if (e instanceof DeviceSelectorError) return { band: null, error: e.message };
      return { band: null, error: 'Errore nel calcolo' };
    }
  }, [mode, ageValue, ageUnit, weight, height]);

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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Device</h1>
        <div className="w-16" />
      </div>

      <div className="card">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Inserisci <strong>uno</strong> dei tre dati (età, peso o altezza) per ottenere i device
          pediatrici appropriati.
        </p>

        {/* Selettore modalità */}
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Dato disponibile
          </p>
          <div className="flex flex-wrap gap-2">
            {(['age', 'weight', 'height'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  mode === m
                    ? 'pill-selected'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                }`}
              >
                {m === 'age' && 'Età'}
                {m === 'weight' && 'Peso'}
                {m === 'height' && 'Altezza'}
              </button>
            ))}
          </div>
        </div>

        {/* Input dinamico */}
        <div className="mt-5">
          {mode === 'age' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="device-age"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Età
                </label>
                <input
                  id="device-age"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={ageValue}
                  onChange={(e) => setAgeValue(e.target.value)}
                  className="input-field"
                  placeholder={ageUnit === 'anni' ? 'Es. 4' : 'Es. 6'}
                  autoFocus
                />
              </div>
              <div>
                <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Unità
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAgeUnit('anni')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      ageUnit === 'anni'
                        ? 'pill-selected'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                    }`}
                  >
                    Anni
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgeUnit('mesi')}
                    className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      ageUnit === 'mesi'
                        ? 'pill-selected'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                    }`}
                  >
                    Mesi
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'weight' && (
            <div>
              <label
                htmlFor="device-weight"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Peso (kg)
              </label>
              <input
                id="device-weight"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="input-field"
                placeholder="Es. 15"
                autoFocus
              />
            </div>
          )}

          {mode === 'height' && (
            <div>
              <label
                htmlFor="device-height"
                className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Altezza (cm)
              </label>
              <input
                id="device-height"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="input-field"
                placeholder="Es. 100"
                autoFocus
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {band && <ResultCard band={band} />}
      </div>

      {/* Pulsante Maschera di Venturi */}
      <button
        type="button"
        onClick={() => onNavigate({ name: 'venturi' })}
        className="group mt-4 flex w-full items-center justify-between rounded-2xl border-2 border-cyan-200 bg-cyan-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-cyan-700 dark:bg-cyan-950/30"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-500 dark:text-cyan-400">
            Strumento
          </p>
          <p className="text-base font-bold text-cyan-900 dark:text-cyan-100">
            Maschera di Venturi
          </p>
          <p className="text-xs text-cyan-700/70 dark:text-cyan-300/70">
            Filtri colorati — L/min e FiO₂
          </p>
        </div>
        <span className="text-2xl text-cyan-300 dark:text-cyan-600 transition group-hover:translate-x-1">→</span>
      </button>

      {/* Link a Elettricità */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drug-detail', drugId: 'elettricita' })}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
          </svg>
          Vai a Elettricità (dosi defibrillazione)
        </button>
      </div>
    </div>
  );
}

function ResultCard({ band }: { band: DeviceBand }) {
  const s = bandStyles[band.id];
  return (
    <div className={`mt-6 rounded-2xl border-2 p-5 ${s.border} ${s.bg}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wide ${s.text}`}>
            Fascia
          </p>
          <p className={`text-2xl font-bold ${s.text}`}>{band.label}</p>
        </div>
        <div className={`text-right text-xs ${s.text}`}>
          <p>{band.ageLabel}</p>
          <p>{band.weightLabel}</p>
          <p>{band.heightLabel}</p>
        </div>
      </div>

      <DeviceRow label="Cannula orofaringea" value={band.devices.cannulaOrofaringea} />
      <DeviceRow label="Sonda aspirazione" value={band.devices.sondaAspirazione} />
      <DeviceRow label="Lama laringoscopio" value={band.devices.lamaLaringoscopio} />
      <DeviceRow label="Tubo endotracheale" value={band.devices.tuboEndotracheale} />
      <DeviceRow label="Tubo laringeo" value={band.devices.tuboLaringeo} />
      <DeviceRow
        label="Pallone autoespansibile / Va e Vieni"
        value={band.devices.palloneAutoespansibile}
      />
      <DeviceRow label="Maschera ventilazione" value={band.devices.mascheraVentilazione} />
      <DeviceRow label="CVP" value={band.devices.cvp} />
      <DeviceRow label="IO" value={band.devices.io} subNote={band.devices.ioSiti} />
      <DeviceRow label="SNG" value={band.devices.sng} />
      <DeviceRow label="CV" value={band.devices.cv} isLast />
    </div>
  );
}

function DeviceRow({
  label,
  value,
  subNote,
  isLast = false,
}: {
  label: string;
  value: string;
  subNote?: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`py-2 ${isLast ? '' : 'border-b border-slate-300/40 dark:border-slate-600/40'}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</dt>
        <dd className="text-right text-base font-bold text-slate-900 dark:text-slate-100">
          {value}
        </dd>
      </div>
      {subNote && (
        <p className="mt-0.5 text-right text-xs text-slate-500 dark:text-slate-400">{subNote}</p>
      )}
    </div>
  );
}
