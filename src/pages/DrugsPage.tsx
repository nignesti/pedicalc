import { useMemo, useState } from 'react';
import type { View } from '../App';
import { drugs } from '../data/drugs';

interface DrugsPageProps {
  onNavigate: (view: View) => void;
}

export function DrugsPage({ onNavigate }: DrugsPageProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...drugs].sort((a, b) => a.name.localeCompare(b.name, 'it'));
    if (!q) return sorted;
    return sorted.filter((d) => d.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Farmaci</h1>
        <div className="w-16" />
      </div>

      <div className="mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca un farmaco..."
          className="input-field"
          autoFocus
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((drug) => (
          <button
            key={drug.id}
            type="button"
            onClick={() => onNavigate({ name: 'drug-detail', drugId: drug.id })}
            className="card flex flex-col items-start text-left transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:hover:border-brand-500"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {drug.name}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {drug.indications.length === 1
                ? drug.indications[0].label
                : `${drug.indications.length} indicazioni`}
            </p>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Nessun farmaco trovato per "{query}"
        </p>
      )}
    </div>
  );
}
