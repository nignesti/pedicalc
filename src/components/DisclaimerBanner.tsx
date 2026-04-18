import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import type { View } from '../App';

const STORAGE_KEY = 'pedicalc-disclaimer-ack';
const SHIFT_MS = 8 * 60 * 60 * 1000; // 8 ore

function isAcknowledgedRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    return Number.isFinite(ts) && Date.now() - ts < SHIFT_MS;
  } catch {
    return false;
  }
}

function saveAcknowledgment() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch { /* noop */ }
}

interface DisclaimerBannerProps {
  onNavigate?: (view: View) => void;
}

export function DisclaimerBanner({ onNavigate }: DisclaimerBannerProps) {
  const [acknowledged, setAcknowledged] = useState(isAcknowledgedRecently);
  const [checked, setChecked] = useState(false);

  function acknowledge() {
    if (!checked) return;
    saveAcknowledgment();
    setAcknowledged(true);
  }

  if (acknowledged) {
    return (
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate?.({ name: 'about' })}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
              aria-label="Chi sono"
            >
              <img src="/pwa-192x192.png" alt="PediCalc" className="h-8 w-8 rounded-lg" />
            </button>
            <div className="flex items-center rounded-lg bg-brand-600 px-2 py-0.5">
              <span className="text-sm font-bold text-white">Pedi</span>
              <span className="text-sm font-bold text-brand-200">Calc</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/80">
      <div className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Avviso importante
          </h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <p>
            <strong>PediCalc</strong> è uno strumento di natura{' '}
            <strong>educativa e formativa</strong>.
          </p>
          <p>
            Questa web app <strong>non sostituisce</strong> la decisione clinica del professionista
            sanitario e rappresenta <strong>solo un supporto al calcolo</strong> dei dosaggi.
          </p>
          <p>
            L'utilizzo dell'app implica piena assunzione di responsabilità professionale da parte
            dell'operatore. I dosaggi proposti vanno sempre verificati con le fonti ufficiali e
            contestualizzati al singolo paziente.
          </p>
        </div>
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-5 w-5 cursor-pointer rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900"
          />
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            Ho letto e compreso
          </span>
        </label>
        <button
          type="button"
          onClick={acknowledge}
          disabled={!checked}
          className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          Accedi all'app
        </button>
      </div>
    </div>
  );
}
