import type { View } from '../App';

interface VenturiPageProps {
  onNavigate: (view: View) => void;
}

interface VenturiEntry {
  colorName: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
  lmin: number;
  fio2: number;
}

const VENTURI: VenturiEntry[] = [
  {
    colorName: 'Blu',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-900 dark:text-blue-100',
    dot: 'bg-blue-600',
    lmin: 2,
    fio2: 24,
  },
  {
    colorName: 'Bianco',
    bg: 'bg-slate-50 dark:bg-slate-800/60',
    border: 'border-slate-300 dark:border-slate-600',
    text: 'text-slate-900 dark:text-slate-100',
    dot: 'bg-slate-400',
    lmin: 4,
    fio2: 28,
  },
  {
    colorName: 'Arancione',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-700',
    text: 'text-orange-900 dark:text-orange-100',
    dot: 'bg-orange-500',
    lmin: 6,
    fio2: 31,
  },
  {
    colorName: 'Giallo',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-300 dark:border-yellow-600',
    text: 'text-yellow-900 dark:text-yellow-100',
    dot: 'bg-yellow-400',
    lmin: 8,
    fio2: 35,
  },
  {
    colorName: 'Rosso',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-900 dark:text-red-100',
    dot: 'bg-red-500',
    lmin: 8,
    fio2: 40,
  },
  {
    colorName: 'Rosa',
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-300 dark:border-pink-700',
    text: 'text-pink-900 dark:text-pink-100',
    dot: 'bg-pink-400',
    lmin: 12,
    fio2: 50,
  },
  {
    colorName: 'Verde',
    bg: 'bg-green-50 dark:bg-green-950/40',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-900 dark:text-green-100',
    dot: 'bg-green-500',
    lmin: 15,
    fio2: 60,
  },
];

export function VenturiPage({ onNavigate }: VenturiPageProps) {
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
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Maschera di Venturi</h1>
        <div className="w-20" />
      </div>

      {/* Intro */}
      <div className="card mb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Litri al minuto da erogare dal gruppo ossigeno per ottenere la percentuale di FiO₂ indicata con ciascun filtro colorato.
        </p>
      </div>

      {/* Tabella colori */}
      <div className="space-y-3">
        {VENTURI.map((v) => (
          <div
            key={v.colorName}
            className={`rounded-2xl border-2 px-5 py-4 ${v.bg} ${v.border}`}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Colore + nome */}
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 flex-shrink-0 rounded-full ${v.dot} shadow-sm`} />
                <span className={`text-base font-semibold ${v.text}`}>{v.colorName}</span>
              </div>

              {/* Litri e FiO2 */}
              <div className="flex items-baseline gap-5">
                <div className="text-right">
                  <p className={`text-xs font-medium uppercase tracking-wide opacity-70 ${v.text}`}>
                    L/min
                  </p>
                  <p className={`text-2xl font-bold tabular-nums ${v.text}`}>{v.lmin}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium uppercase tracking-wide opacity-70 ${v.text}`}>
                    FiO₂
                  </p>
                  <p className={`text-2xl font-bold tabular-nums ${v.text}`}>{v.fio2}%</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nota */}
      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        I valori di FiO₂ sono approssimativi e possono variare con la ventilazione del paziente.
      </p>
    </div>
  );
}
