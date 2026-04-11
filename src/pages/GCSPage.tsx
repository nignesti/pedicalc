/**
 * Glasgow Coma Scale modificata per lattanti e bambini.
 * Fonte: Manuale MSD (Davis RJ et al., James H et al., Morray JP et al., Carney N et al.)
 */

import { useState } from 'react';
import type { View } from '../App';

interface GCSPageProps {
  onNavigate: (view: View) => void;
}

type PatientType = 'lattante' | 'bambino';

interface GCSItem {
  score: number;
  lattante: string;
  bambino: string;
}

const OCCHI: GCSItem[] = [
  { score: 4, lattante: 'Aperti spontaneamente', bambino: 'Aperti spontaneamente' },
  { score: 3, lattante: 'Aperti in risposta agli stimoli verbali', bambino: 'Aperti in risposta agli stimoli verbali' },
  { score: 2, lattante: 'Aperti solo in risposta al dolore', bambino: 'Aperti solo in risposta al dolore' },
  { score: 1, lattante: 'Nessuna risposta', bambino: 'Nessuna risposta' },
];

const VERBALE: GCSItem[] = [
  { score: 5, lattante: 'Farfuglia e balbetta', bambino: 'Orientato, appropriato' },
  { score: 4, lattante: 'Irritabile, piange', bambino: 'Confuso' },
  { score: 3, lattante: 'Piange in risposta al dolore', bambino: 'Parole inappropriate' },
  { score: 2, lattante: 'Lamenti in risposta al dolore', bambino: 'Parole incomprensibili o suoni non specifici' },
  { score: 1, lattante: 'Nessuna risposta', bambino: 'Nessuna risposta' },
];

const MOTORIA: GCSItem[] = [
  { score: 6, lattante: 'Si muove spontaneamente e intenzionalmente', bambino: 'Obbedisce ai comandi' },
  { score: 5, lattante: 'Si ritrae al tatto', bambino: 'Localizza lo stimolo doloroso' },
  { score: 4, lattante: 'Si ritrae in risposta al dolore', bambino: 'Si ritrae in risposta al dolore' },
  { score: 3, lattante: 'Risponde al dolore con postura decorticata (flessione anomala)', bambino: 'Risponde al dolore con postura decorticata (flessione anomala)' },
  { score: 2, lattante: 'Risponde al dolore con postura decerebrata (estensione anomala)', bambino: 'Risponde al dolore con postura decerebrata (estensione anomala)' },
  { score: 1, lattante: 'Nessuna risposta', bambino: 'Nessuna risposta' },
];

function getInterpretation(total: number): { text: string; color: string; bg: string; border: string } {
  if (total <= 8) return {
    text: `GCS ${total} — Grave. Possibile necessità di intubazione e ventilazione. Monitorare PIC.`,
    color: 'text-rose-900 dark:text-rose-100',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-400 dark:border-rose-600',
  };
  if (total <= 12) return {
    text: `GCS ${total} — Trauma cranico grave. Rivalutare continuamente.`,
    color: 'text-amber-900 dark:text-amber-100',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-400 dark:border-amber-600',
  };
  if (total <= 14) return {
    text: `GCS ${total} — Moderato.`,
    color: 'text-yellow-900 dark:text-yellow-100',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-400 dark:border-yellow-600',
  };
  return {
    text: `GCS ${total} — Normale (o lieve alterazione).`,
    color: 'text-emerald-900 dark:text-emerald-100',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-400 dark:border-emerald-600',
  };
}

interface SectionProps {
  title: string;
  abbrev: string;
  items: GCSItem[];
  patientType: PatientType;
  selected: number | null;
  onSelect: (score: number) => void;
  maxScore: number;
}

function GCSSection({ title, abbrev, items, patientType, selected, onSelect, maxScore }: SectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{abbrev}</span>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
        <span className={`text-xl font-bold tabular-nums ${selected !== null ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-600'}`}>
          {selected !== null ? selected : '—'}<span className="text-xs font-medium text-slate-400 dark:text-slate-500">/{maxScore}</span>
        </span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {items.map((item) => {
          const isSelected = selected === item.score;
          return (
            <button
              key={item.score}
              type="button"
              onClick={() => onSelect(item.score)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                isSelected
                  ? 'bg-brand-50 dark:bg-brand-900/40'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {/* Score badge */}
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition ${
                isSelected
                  ? 'bg-brand-600 text-white dark:bg-brand-500'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {item.score}
              </span>
              {/* Description */}
              <span className={`text-sm leading-snug ${
                isSelected
                  ? 'font-semibold text-brand-900 dark:text-brand-100'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {patientType === 'lattante' ? item.lattante : item.bambino}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GCSPage({ onNavigate }: GCSPageProps) {
  const [patientType, setPatientType] = useState<PatientType>('bambino');
  const [occhi, setOcchi] = useState<number | null>(null);
  const [verbale, setVerbale] = useState<number | null>(null);
  const [motoria, setMotoria] = useState<number | null>(null);

  const total = (occhi ?? 0) + (verbale ?? 0) + (motoria ?? 0);
  const hasAll = occhi !== null && verbale !== null && motoria !== null;
  const hasAny = occhi !== null || verbale !== null || motoria !== null;

  const interp = hasAll ? getInterpretation(total) : null;

  function handleReset() {
    setOcchi(null);
    setVerbale(null);
    setMotoria(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate({ name: 'vital-signs' })}
          className="btn-ghost inline-flex items-center gap-1"
        >
          <span aria-hidden="true">←</span> Parametri vitali
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">GCS Pediatrico</h1>
        <button
          type="button"
          onClick={handleReset}
          disabled={!hasAny}
          className="btn-ghost text-sm disabled:opacity-30"
        >
          Reset
        </button>
      </div>

      {/* Selettore tipo paziente */}
      <div className="card mb-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Tipo di paziente
        </p>
        <div className="flex gap-2">
          {(['bambino', 'lattante'] as PatientType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPatientType(t)}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition capitalize ${
                patientType === t
                  ? 'pill-selected'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'bambino' ? 'Bambino' : 'Lattante'}
            </button>
          ))}
        </div>
        {patientType === 'lattante' && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Se intubato, non cosciente o preverbale, la risposta <strong>motoria</strong> è la componente più importante.
          </p>
        )}
      </div>

      {/* Score parziale in tempo reale */}
      {hasAny && (
        <div className="mb-4 flex items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <ScorePill label="O" value={occhi} max={4} />
          <span className="text-slate-400 dark:text-slate-500 font-light text-lg">+</span>
          <ScorePill label="V" value={verbale} max={5} />
          <span className="text-slate-400 dark:text-slate-500 font-light text-lg">+</span>
          <ScorePill label="M" value={motoria} max={6} />
          <span className="text-slate-400 dark:text-slate-500 font-light text-lg">=</span>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">Totale</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
              {hasAll ? total : `${total}?`}
            </p>
          </div>
        </div>
      )}

      {/* Sezioni GCS */}
      <div className="space-y-3">
        <GCSSection
          title="Apertura degli occhi"
          abbrev="O"
          items={OCCHI}
          patientType={patientType}
          selected={occhi}
          onSelect={setOcchi}
          maxScore={4}
        />
        <GCSSection
          title="Risposta verbale"
          abbrev="V"
          items={VERBALE}
          patientType={patientType}
          selected={verbale}
          onSelect={setVerbale}
          maxScore={5}
        />
        <GCSSection
          title="Risposta motoria"
          abbrev="M"
          items={MOTORIA}
          patientType={patientType}
          selected={motoria}
          onSelect={setMotoria}
          maxScore={6}
        />
      </div>

      {/* Interpretazione finale */}
      {interp && (
        <div className={`mt-4 rounded-2xl border-2 p-4 ${interp.border} ${interp.bg}`}>
          <p className={`text-sm font-semibold ${interp.color}`}>{interp.text}</p>
          {total <= 8 && (
            <p className="mt-1 text-xs text-rose-800/80 dark:text-rose-200/80">
              Considerare intubazione e ventilazione. Monitoraggio pressione endocranica.
            </p>
          )}
        </div>
      )}

      {/* Legenda soglie */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Soglie cliniche</p>
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
            <span><strong>≤ 8</strong> — Possibile necessità di intubazione/ventilazione e monitoraggio PIC</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <span><strong>≤ 12</strong> — Suggerisce trauma cranico grave</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span><strong>15</strong> — Massimo punteggio</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Se il paziente è intubato, non cosciente o preverbale, la risposta motoria è la componente più importante.
        </p>
      </div>
    </div>
  );
}

function ScorePill({ label, value, max }: { label: string; value: number | null; max: number }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-300">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${value !== null ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`}>
        {value ?? '—'}<span className="text-xs font-normal text-slate-400 dark:text-slate-400">/{max}</span>
      </p>
    </div>
  );
}
