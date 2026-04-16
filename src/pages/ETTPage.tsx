/**
 * Calcolatore tubo endotracheale pediatrico.
 * Input: età (anni/mesi).
 * Output: diametro (cuffiato + non cuffiato), profondità inserimento,
 *         aspiratore endotracheale e lama laringoscopio suggerita.
 *
 * Formule standard:
 * - Diametro non cuffiato: 4 + (età in anni)/4   (> 2 anni)
 * - Diametro cuffiato:    3.5 + (età in anni)/4  (> 2 anni)
 * - Profondità labbro:     3 x diametro
 * - Profondità narinare:   profondità labbro + 3 cm
 * - Aspiratore (French):   2 x diametro (arrotondato)
 */

import { useMemo } from 'react';
import type { View } from '../App';
import { usePatient } from '../context/PatientContext';

interface ETTPageProps {
  onNavigate: (view: View) => void;
}

interface ETTResult {
  ageLabel: string;
  diameterUncuffed: number;
  diameterCuffed: number;
  depthOral: string; // in cm
  depthNasal: string; // in cm
  suctionFrench: number;
  blade: string;
  note?: string;
}

function roundHalf(n: number): number {
  return Math.round(n * 2) / 2;
}

/** Calcola tutti i parametri per un bambino dato l'età in mesi. */
function calcETT(ageMonths: number): ETTResult {
  let diameterUncuffed: number;
  let diameterCuffed: number;
  let ageLabel: string;
  let note: string | undefined;

  if (ageMonths < 1) {
    ageLabel = 'Neonato (termine)';
    diameterUncuffed = 3.5;
    diameterCuffed = 3.0;
    note = 'Prematuri: valutare 2.5-3.0 non cuffiato.';
  } else if (ageMonths < 6) {
    ageLabel = '1-6 mesi';
    diameterUncuffed = 3.5;
    diameterCuffed = 3.0;
  } else if (ageMonths < 12) {
    ageLabel = '6-12 mesi';
    diameterUncuffed = 4.0;
    diameterCuffed = 3.5;
  } else if (ageMonths < 24) {
    ageLabel = '1-2 anni';
    diameterUncuffed = 4.5;
    diameterCuffed = 4.0;
  } else {
    const years = ageMonths / 12;
    ageLabel = `${Math.floor(years)} ${Math.floor(years) === 1 ? 'anno' : 'anni'}`;
    diameterUncuffed = roundHalf(4 + years / 4);
    diameterCuffed = roundHalf(3.5 + years / 4);
  }

  // Profondità inserimento (cm), basata sul tubo non cuffiato
  const oral = diameterUncuffed * 3;
  const nasal = oral + 3;

  // Aspiratore (French) = 2 x diametro, arrotondato al numero intero
  const suction = Math.round(diameterUncuffed * 2);

  // Lama laringoscopio
  let blade: string;
  if (ageMonths < 1) blade = 'Miller 0 (retta)';
  else if (ageMonths < 24) blade = 'Miller 1 (retta)';
  else if (ageMonths < 96) blade = 'Miller 2 o Macintosh 2';
  else blade = 'Macintosh 3 (curva)';

  return {
    ageLabel,
    diameterUncuffed,
    diameterCuffed,
    depthOral: oral.toFixed(1),
    depthNasal: nasal.toFixed(1),
    suctionFrench: suction,
    blade,
    note,
  };
}

export function ETTPage({ onNavigate }: ETTPageProps) {
  const { age, setAge, ageUnit, setAgeUnit } = usePatient();

  const { result, error } = useMemo<{ result: ETTResult | null; error: string | null }>(() => {
    const v = parseFloat(age);
    if (!Number.isFinite(v) || v < 0) return { result: null, error: null };
    const ageMonths = ageUnit === 'mesi' ? v : v * 12;
    if (ageMonths > 18 * 12) {
      return { result: null, error: "L'età supera l'ambito pediatrico (0-18 anni)." };
    }
    return { result: calcETT(ageMonths), error: null };
  }, [age, ageUnit]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'devices' })}
          className="btn-ghost inline-flex items-center gap-1"
        >
          <span aria-hidden="true">←</span> Device
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tubo endotracheale</h1>
        <div className="w-20" />
      </div>

      {/* Input età */}
      <div className="card">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Inserisci l'età del paziente per ottenere diametro, profondità, aspiratore e lama suggerita.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="ett-age"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Età
            </label>
            <input
              id="ett-age"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
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

        {error && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-3">
            {/* Diametro */}
            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 p-5 dark:border-teal-800 dark:bg-teal-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                Diametro tubo — {result.ageLabel}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3 text-center dark:bg-slate-900/40">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300">Non cuffiato</p>
                  <p className="mt-1 text-3xl font-bold text-teal-900 dark:text-teal-100">
                    {result.diameterUncuffed.toFixed(1)}
                  </p>
                  <p className="text-xs text-teal-700/70 dark:text-teal-300/70">mm DI</p>
                </div>
                <div className="rounded-xl bg-white/70 p-3 text-center dark:bg-slate-900/40">
                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300">Cuffiato</p>
                  <p className="mt-1 text-3xl font-bold text-teal-900 dark:text-teal-100">
                    {result.diameterCuffed.toFixed(1)}
                  </p>
                  <p className="text-xs text-teal-700/70 dark:text-teal-300/70">mm DI</p>
                </div>
              </div>
              {result.note && (
                <p className="mt-3 text-xs text-teal-700/80 dark:text-teal-300/80">{result.note}</p>
              )}
            </div>

            {/* Profondità */}
            <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                Profondità inserimento
              </p>
              <dl className="mt-3 space-y-2">
                <Row
                  label="Commessura labiale"
                  value={`${result.depthOral} cm`}
                  colorClass="text-indigo-900 dark:text-indigo-100"
                />
                <Row
                  label="Narinare"
                  value={`${result.depthNasal} cm`}
                  colorClass="text-indigo-900 dark:text-indigo-100"
                  isLast
                />
              </dl>
              <p className="mt-3 text-xs text-indigo-700/80 dark:text-indigo-300/80">
                Verifica sempre con auscultazione bilaterale, capnografia e Rx torace.
              </p>
            </div>

            {/* Aspiratore */}
            <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 dark:border-sky-800 dark:bg-sky-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">
                Aspiratore endotracheale
              </p>
              <p className="mt-2 text-2xl font-bold text-sky-900 dark:text-sky-100">
                {result.suctionFrench} Fr
              </p>
              <p className="text-xs text-sky-700/80 dark:text-sky-300/80">
                Regola: 2 x diametro del tubo
              </p>
            </div>

            {/* Lama laringoscopio */}
            <div className="rounded-2xl border-2 border-fuchsia-200 bg-fuchsia-50 p-5 dark:border-fuchsia-800 dark:bg-fuchsia-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">
                Lama laringoscopio suggerita
              </p>
              <p className="mt-2 text-2xl font-bold text-fuchsia-900 dark:text-fuchsia-100">
                {result.blade}
              </p>
              <p className="text-xs text-fuchsia-700/80 dark:text-fuchsia-300/80">
                Nei più piccoli si preferisce la lama retta (Miller) per sollevare direttamente l'epiglottide.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  colorClass,
  isLast = false,
}: {
  label: string;
  value: string;
  colorClass: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 ${
        isLast ? '' : 'border-b border-indigo-200/60 pb-2 dark:border-indigo-800/60'
      }`}
    >
      <dt className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</dt>
      <dd className={`text-right text-base font-bold ${colorClass}`}>{value}</dd>
    </div>
  );
}
