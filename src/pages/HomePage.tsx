import { useMemo, useState } from 'react';
import type { View } from '../App';
import { usePatient } from '../context/PatientContext';

interface HomePageProps {
  onNavigate: (view: View) => void;
}

/** Stima peso (kg) in base all'età. Restituisce null se fuori range. */
function estimateWeight(ageValue: string, ageUnit: 'anni' | 'mesi'): number | null {
  const v = parseFloat(ageValue);
  if (!Number.isFinite(v) || v <= 0) return null;
  const months = ageUnit === 'mesi' ? v : v * 12;
  if (months < 1) return null;
  if (months < 12) return Math.round((months / 2 + 4) * 10) / 10;
  const years = months / 12;
  if (years <= 5) return Math.round((years * 2 + 8) * 10) / 10;
  if (years <= 12) return Math.round((years * 3 + 7) * 10) / 10;
  return null;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { weight, setWeight, age, setAge, ageUnit, setAgeUnit, reset } = usePatient();
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateAge, setEstimateAge] = useState('');
  const [estimateUnit, setEstimateUnit] = useState<'anni' | 'mesi'>('anni');

  const estimated = useMemo(
    () => estimateWeight(estimateAge, estimateUnit),
    [estimateAge, estimateUnit]
  );

  const hasPatient = weight !== '' || age !== '';

  const weightNum = parseFloat(weight);
  const ageNum = parseFloat(age);
  const hasWeight = Number.isFinite(weightNum) && weightNum > 0;
  const weightError =
    weight !== '' && Number.isFinite(weightNum) && weightNum < 1
      ? 'Peso troppo basso — verifica il dato inserito.'
      : null;
  const weightWarn =
    weight !== '' && Number.isFinite(weightNum) && weightNum > 100
      ? 'Peso insolito per un paziente pediatrico — verifica.'
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          PediCalc
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
          Supporto al calcolo in emergenza pediatrica
        </p>
      </div>

      {/* Profilo paziente */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Paziente
          </h2>
          {hasPatient && (
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition"
            >
              Nuovo paziente ×
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* Peso */}
          <div>
            <label
              htmlFor="home-weight"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Peso (kg)
            </label>
            <input
              id="home-weight"
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
            {weightError && (
              <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{weightError}</p>
            )}
            {weightWarn && (
              <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">{weightWarn}</p>
            )}
          </div>

          {/* Età opzionale */}
          <div>
            <label
              htmlFor="home-age"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Età{' '}
              <span className="normal-case font-normal text-slate-400 dark:text-slate-500">(opzionale)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="home-age"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-field flex-1"
                placeholder="Es. 4"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setAgeUnit('anni')}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    ageUnit === 'anni'
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  anni
                </button>
                <button
                  type="button"
                  onClick={() => setAgeUnit('mesi')}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    ageUnit === 'mesi'
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  mesi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stima peso */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowEstimate((v) => !v)}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition"
          >
            {showEstimate ? '▲ Nascondi stima' : '▼ Non conosci il peso? Stimalo dall\'età'}
          </button>

          {showEstimate && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Formula APLS — stima approssimativa, valida 1 mese–12 anni
              </p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={estimateAge}
                  onChange={(e) => setEstimateAge(e.target.value)}
                  className="input-field w-24"
                  placeholder="Età"
                />
                <button
                  type="button"
                  onClick={() => setEstimateUnit('anni')}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    estimateUnit === 'anni'
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  anni
                </button>
                <button
                  type="button"
                  onClick={() => setEstimateUnit('mesi')}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    estimateUnit === 'mesi'
                      ? 'pill-selected'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  mesi
                </button>
                {estimated !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setWeight(String(estimated));
                      setShowEstimate(false);
                    }}
                    className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
                  >
                    Usa {estimated} kg
                  </button>
                )}
              </div>
              {estimateAge && estimated === null && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  Età fuori range (valida 1 mese–12 anni)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sezioni */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'drugs' })}
          className="card group flex flex-col items-start text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg dark:hover:border-brand-500"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700 transition group-hover:bg-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:group-hover:bg-brand-900/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
              <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
              <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Farmaci</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Calcola i dosaggi pediatrici in base al peso del paziente
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate({ name: 'vital-signs' })}
          className="card group flex flex-col items-start text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg dark:hover:border-brand-500"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 transition group-hover:bg-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:group-hover:bg-rose-900/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Parametri vitali
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Range di riferimento FR, FC e PA in base all'età
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate({ name: 'devices' })}
          className="card group flex flex-col items-start text-left transition hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg dark:hover:border-brand-500"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:group-hover:bg-emerald-900/60">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Device</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Dispositivi per fascia pediatrica in base a età, peso o altezza
          </p>
        </button>
      </div>

      {/* Emergenza — Dosi pronte — visibile solo con peso inserito */}
      {hasWeight && !weightError && (
        <button
          type="button"
          onClick={() => onNavigate({ name: 'summary' })}
          className="card group mt-4 flex w-full items-center justify-between gap-4 border-2 border-rose-500 bg-rose-50 text-left transition hover:-translate-y-1 hover:shadow-lg dark:border-rose-600 dark:bg-rose-950/30"
        >
          <div className="flex items-center gap-4">
            {/* Icona croce rossa */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md dark:bg-rose-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                Peso: {weightNum} kg{ageNum && Number.isFinite(ageNum) ? ` · Età: ${ageNum} ${ageUnit}` : ''}
              </p>
              <h2 className="mt-0.5 text-xl font-bold text-rose-800 dark:text-rose-100">
                Emergenza — Dosi pronte
              </h2>
              <p className="mt-0.5 text-sm text-rose-700/70 dark:text-rose-300/70">
                Farmaci principali e parametri per il paziente
              </p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
            className="h-8 w-8 flex-shrink-0 text-rose-500 transition group-hover:translate-x-1" aria-hidden="true">
            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Antidoti — sempre visibile (ultimo pulsante) */}
      <button
        type="button"
        onClick={() => onNavigate({ name: 'antidotes' })}
        className="group mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-purple-200 bg-purple-50 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md dark:border-purple-700 dark:bg-purple-950/30"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm dark:bg-purple-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7"
              aria-hidden="true"
            >
              <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
              <path d="M3.265 10.602 11.644 15.1a.75.75 0 0 0 .712 0l8.379-4.498c.454.445.454 1.17 0 1.615l-8.379 4.498a2.25 2.25 0 0 1-2.134 0l-8.379-4.498a1.15 1.15 0 0 1 0-1.615Z" />
              <path d="M3.265 15.352 11.644 19.85a.75.75 0 0 0 .712 0l8.379-4.498c.454.445.454 1.17 0 1.615l-8.379 4.498a2.25 2.25 0 0 1-2.134 0l-8.379-4.498a1.15 1.15 0 0 1 0-1.615Z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              Tossicologia
            </p>
            <h2 className="mt-0.5 text-lg font-bold text-purple-900 dark:text-purple-100">
              Antidoti
            </h2>
            <p className="mt-0.5 text-xs text-purple-700/70 dark:text-purple-300/70">
              Intossicazioni comuni e antidoti corrispondenti
            </p>
          </div>
        </div>
        <span className="text-2xl text-purple-500 dark:text-purple-400 transition group-hover:translate-x-1">
          →
        </span>
      </button>
    </div>
  );
}
