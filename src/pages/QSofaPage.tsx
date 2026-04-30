/**
 * qSOFA — Quick Sequential Organ Failure Assessment.
 * 3 criteri binari (0/1) → punteggio 0-3.
 * Score ≥ 2 indica alto rischio di outcome sfavorevole in pazienti con sospetta sepsi.
 */

import { useState } from 'react';
import type { View } from '../App';

interface QSofaPageProps {
  onNavigate: (view: View) => void;
}

interface Criterion {
  id: 'mentalStatus' | 'respiratoryRate' | 'systolicBP';
  title: string;
  description: string;
}

const CRITERIA: Criterion[] = [
  {
    id: 'mentalStatus',
    title: 'Stato mentale alterato',
    description: 'GCS < 15',
  },
  {
    id: 'respiratoryRate',
    title: 'Frequenza respiratoria elevata',
    description: '≥ 22 atti/min',
  },
  {
    id: 'systolicBP',
    title: 'Pressione sistolica bassa',
    description: '≤ 100 mmHg',
  },
];

type Scores = Record<Criterion['id'], boolean | null>;

function interpret(total: number): {
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
} {
  if (total >= 2)
    return {
      label: 'Alto rischio',
      sublabel: 'Valutare criteri SOFA completo — possibile sepsi',
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-300 dark:border-red-800',
    };
  if (total === 1)
    return {
      label: 'Rischio basso',
      sublabel: 'Monitorare il paziente e rivalutare',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-800',
    };
  return {
    label: 'Rischio basso',
    sublabel: 'Rivalutare se le condizioni cambiano',
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
  };
}

export function QSofaPage({ onNavigate }: QSofaPageProps) {
  const [scores, setScores] = useState<Scores>({
    mentalStatus: null,
    respiratoryRate: null,
    systolicBP: null,
  });

  const total = Object.values(scores).reduce<number>(
    (acc, v) => acc + (v === true ? 1 : 0),
    0
  );

  const allFilled = Object.values(scores).every((v) => v !== null);
  const interp = interpret(total);

  function toggle(id: Criterion['id'], value: boolean) {
    setScores((s) => ({ ...s, [id]: s[id] === value ? null : value }));
  }

  function reset() {
    setScores({ mentalStatus: null, respiratoryRate: null, systolicBP: null });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'vital-signs' })}
          className="btn-ghost inline-flex items-center gap-1"
        >
          <span aria-hidden="true">←</span> Parametri
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">qSOFA</h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition"
        >
          Reset ×
        </button>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Strumento di screening rapido per identificare pazienti con sospetta infezione a rischio di
        outcome sfavorevole.
      </p>

      {/* Punteggio live */}
      <div className={`mb-5 rounded-2xl border-2 px-5 py-4 transition ${interp.border} ${interp.bg}`}>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Punteggio qSOFA
            </p>
            <p className={`text-5xl font-bold tabular-nums ${interp.color}`}>
              {total} <span className="text-2xl opacity-60">/3</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-base font-bold ${interp.color}`}>{interp.label}</p>
            {allFilled && (
              <p className={`mt-0.5 text-xs ${interp.color} opacity-80`}>{interp.sublabel}</p>
            )}
          </div>
        </div>
        {!allFilled && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Seleziona Sì o No per ciascun criterio.
          </p>
        )}
      </div>

      {/* Criteri */}
      <div className="space-y-3">
        {CRITERIA.map((criterion) => {
          const val = scores[criterion.id];
          return (
            <div key={criterion.id} className="card">
              <div className="mb-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {criterion.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{criterion.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggle(criterion.id, true)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    val === true
                      ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/40 dark:text-red-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-red-300 hover:bg-red-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-red-500 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      val === true ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    1
                  </span>
                  Sì
                </button>
                <button
                  type="button"
                  onClick={() => toggle(criterion.id, false)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                    val === false
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                      val === false ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    0
                  </span>
                  No
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        <p className="font-semibold">Interpretazione:</p>
        <ul className="mt-1 space-y-0.5">
          <li>
            <span className="font-bold text-red-700 dark:text-red-400">≥ 2</span> — alto rischio,
            valutare criteri SOFA completo
          </li>
          <li>
            <span className="font-bold text-amber-700 dark:text-amber-400">1</span> — rischio basso,
            monitorare e rivalutare
          </li>
          <li>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">0</span> — rischio
            basso
          </li>
        </ul>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Il qSOFA non è diagnostico: un punteggio basso non esclude la sepsi. Rivalutare se le
          condizioni cliniche cambiano.
        </p>
      </div>

      {/* Punteggio riepilogativo in fondo */}
      <div className={`mt-4 rounded-2xl border-2 px-5 py-4 transition ${interp.border} ${interp.bg}`}>
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Punteggio qSOFA
            </p>
            <p className={`text-5xl font-bold tabular-nums ${interp.color}`}>
              {total} <span className="text-2xl opacity-60">/3</span>
            </p>
          </div>
          <div className="text-right">
            <p className={`text-base font-bold ${interp.color}`}>{interp.label}</p>
            {allFilled ? (
              <p className={`mt-0.5 text-xs ${interp.color} opacity-80`}>{interp.sublabel}</p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">Completa tutti i criteri</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
