/**
 * Indice di APGAR — valutazione del neonato a 1', 5' (e 10' se <7).
 * 5 parametri × 3 livelli (0-1-2) → punteggio 0-10.
 */

import { useState } from 'react';
import type { View } from '../App';

interface APGARPageProps {
  onNavigate: (view: View) => void;
}

interface Option {
  value: 0 | 1 | 2;
  label: string;
}

interface APGARCategory {
  id: 'aspetto' | 'polso' | 'grimace' | 'attivita' | 'respiro';
  title: string;
  subtitle: string;
  options: Option[];
}

const CATEGORIES: APGARCategory[] = [
  {
    id: 'aspetto',
    title: 'Aspetto (colore)',
    subtitle: 'A — Appearance',
    options: [
      { value: 0, label: 'Cianotico o pallido (tutto il corpo)' },
      { value: 1, label: 'Corpo rosa, estremità cianotiche' },
      { value: 2, label: 'Completamente rosa' },
    ],
  },
  {
    id: 'polso',
    title: 'Polso (FC)',
    subtitle: 'P — Pulse',
    options: [
      { value: 0, label: 'Assente' },
      { value: 1, label: '< 100 battiti/min' },
      { value: 2, label: '> 100 battiti/min' },
    ],
  },
  {
    id: 'grimace',
    title: 'Grimace (reattività)',
    subtitle: 'G — Grimace / irritabilità riflessa',
    options: [
      { value: 0, label: 'Nessuna risposta' },
      { value: 1, label: 'Smorfia' },
      { value: 2, label: 'Pianto vigoroso o tosse / starnuto' },
    ],
  },
  {
    id: 'attivita',
    title: 'Attività (tono muscolare)',
    subtitle: 'A — Activity',
    options: [
      { value: 0, label: 'Flaccido' },
      { value: 1, label: 'Qualche flessione degli arti' },
      { value: 2, label: 'Movimenti attivi' },
    ],
  },
  {
    id: 'respiro',
    title: 'Respiro',
    subtitle: 'R — Respiration',
    options: [
      { value: 0, label: 'Assente' },
      { value: 1, label: 'Lento, irregolare, debole' },
      { value: 2, label: 'Valido, pianto forte' },
    ],
  },
];

type Scores = Record<APGARCategory['id'], number | null>;

function interpret(total: number): { label: string; color: string; bg: string; border: string } {
  if (total >= 7)
    return {
      label: 'Neonato vigoroso (normale)',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-300 dark:border-emerald-800',
    };
  if (total >= 4)
    return {
      label: 'Asfissia moderata — assistenza',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-800',
    };
  return {
    label: 'Asfissia grave — rianimazione immediata',
    color: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-800',
  };
}

export function APGARPage({ onNavigate }: APGARPageProps) {
  const [scores, setScores] = useState<Scores>({
    aspetto: null,
    polso: null,
    grimace: null,
    attivita: null,
    respiro: null,
  });

  const total =
    (scores.aspetto ?? 0) +
    (scores.polso ?? 0) +
    (scores.grimace ?? 0) +
    (scores.attivita ?? 0) +
    (scores.respiro ?? 0);

  const allFilled = Object.values(scores).every((v) => v !== null);
  const interp = interpret(total);

  function setScore(id: APGARCategory['id'], value: number) {
    setScores((s) => ({ ...s, [id]: value }));
  }

  function reset() {
    setScores({
      aspetto: null,
      polso: null,
      grimace: null,
      attivita: null,
      respiro: null,
    });
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Indice di APGAR</h1>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition"
        >
          Reset ×
        </button>
      </div>

      {/* Punteggio live */}
      <div
        className={`mb-4 rounded-2xl border-2 px-5 py-4 transition ${interp.border} ${interp.bg}`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Punteggio totale
            </p>
            <p className={`text-4xl font-bold tabular-nums ${interp.color}`}>
              {total} <span className="text-xl opacity-60">/10</span>
            </p>
          </div>
          {allFilled && (
            <div className="text-right">
              <p className={`text-sm font-bold ${interp.color}`}>{interp.label}</p>
            </div>
          )}
        </div>
        {!allFilled && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Seleziona un valore per ciascun parametro.
          </p>
        )}
      </div>

      {/* Categorie */}
      <div className="space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="card">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cat.subtitle}</p>
            </div>
            <div className="grid gap-2">
              {cat.options.map((opt) => {
                const selected = scores[cat.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScore(cat.id, opt.value)}
                    className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 text-left text-sm font-medium transition ${
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm dark:border-brand-500 dark:bg-brand-900/40 dark:text-brand-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="flex-1">{opt.label}</span>
                    <span
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                        selected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {opt.value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
        <p className="font-semibold">Interpretazione:</p>
        <ul className="mt-1 space-y-0.5">
          <li>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">7-10</span> — vigoroso
          </li>
          <li>
            <span className="font-bold text-amber-700 dark:text-amber-400">4-6</span> — asfissia
            moderata
          </li>
          <li>
            <span className="font-bold text-red-700 dark:text-red-400">0-3</span> — asfissia grave
          </li>
        </ul>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Valutazione a 1' e 5' dalla nascita. Ripetere a 10' se punteggio &lt; 7 al 5'.
        </p>
      </div>

      {/* Punteggio riepilogativo in fondo */}
      <div
        className={`mt-4 rounded-2xl border-2 px-5 py-4 transition ${interp.border} ${interp.bg}`}
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Punteggio totale
            </p>
            <p className={`text-4xl font-bold tabular-nums ${interp.color}`}>
              {total} <span className="text-xl opacity-60">/10</span>
            </p>
          </div>
          {allFilled ? (
            <div className="text-right">
              <p className={`text-sm font-bold ${interp.color}`}>{interp.label}</p>
            </div>
          ) : (
            <p className="text-right text-xs text-slate-500 dark:text-slate-400">
              Completa tutti i parametri
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
