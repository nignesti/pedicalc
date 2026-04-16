/**
 * Pagina Antidoti.
 * Elenco rapido di antidoti per le intossicazioni pediatriche più comuni.
 * Ogni card è cliccabile e porta al farmaco corrispondente nei Farmaci.
 */

import type { View } from '../App';

interface AntidotesPageProps {
  onNavigate: (view: View) => void;
}

interface Antidote {
  id: string;
  label: string;
  description: string;
  drugId: string;
  drugName: string;
  /** Classi tailwind per il bordo e lo sfondo della card. */
  colorBg: string;
  colorBorder: string;
  colorText: string;
  colorBadge: string;
}

const ANTIDOTES: Antidote[] = [
  {
    id: 'oppiacei',
    label: 'Oppiacei',
    description:
      'Intossicazione da morfina, fentanile, codeina, tramadolo, eroina — depressione respiratoria.',
    drugId: 'naloxone',
    drugName: 'Naloxone',
    colorBg: 'bg-purple-50 dark:bg-purple-950/30',
    colorBorder: 'border-purple-300 dark:border-purple-700',
    colorText: 'text-purple-900 dark:text-purple-100',
    colorBadge: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  },
  {
    id: 'organofosfati',
    label: 'Organofosfati',
    description:
      'Intossicazione da pesticidi — sindrome colinergica (SLUDGE, bradicardia, broncospasmo).',
    drugId: 'atropina',
    drugName: 'Atropina',
    colorBg: 'bg-lime-50 dark:bg-lime-950/30',
    colorBorder: 'border-lime-300 dark:border-lime-700',
    colorText: 'text-lime-900 dark:text-lime-100',
    colorBadge: 'bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-200',
  },
];

export function AntidotesPage({ onNavigate }: AntidotesPageProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Antidoti</h1>
        <div className="w-16" />
      </div>

      {/* Intro */}
      <div className="card mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Seleziona la classe di agente tossico per accedere direttamente all'antidoto e ai suoi dosaggi.
        </p>
      </div>

      {/* Card antidoti */}
      <div className="space-y-3">
        {ANTIDOTES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onNavigate({ name: 'drug-detail', drugId: a.drugId })}
            className={`group flex w-full items-center justify-between gap-4 rounded-2xl border-2 px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${a.colorBg} ${a.colorBorder}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${a.colorText}`}>{a.label}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${a.colorBadge}`}
                >
                  {a.drugName}
                </span>
              </div>
              <p className={`mt-1 text-sm opacity-80 ${a.colorText}`}>{a.description}</p>
            </div>
            <span
              className={`flex-shrink-0 text-2xl transition group-hover:translate-x-1 ${a.colorText} opacity-60`}
            >
              →
            </span>
          </button>
        ))}
      </div>

      {/* Nota */}
      <p className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
        Elenco in espansione. Per intossicazioni non elencate consulta il Centro Antiveleni.
      </p>
    </div>
  );
}
