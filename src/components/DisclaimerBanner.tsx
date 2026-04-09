import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pedicalc-disclaimer-ack';

/**
 * Banner di disclaimer mostrato al primo avvio.
 * L'utente deve confermare di aver letto per accedere all'app.
 * Dopo la conferma, il banner non riappare (stato salvato in localStorage).
 * Un pulsante in alto resta sempre visibile per richiamarlo.
 */
export function DisclaimerBanner() {
  const [acknowledged, setAcknowledged] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setAcknowledged(saved === 'yes');
  }, []);

  function acknowledge() {
    localStorage.setItem(STORAGE_KEY, 'yes');
    setAcknowledged(true);
  }

  if (acknowledged) {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              P
            </div>
            <span className="text-sm font-semibold text-slate-900">PediCalc</span>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setAcknowledged(false);
            }}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-brand-700 hover:underline"
          >
            Mostra avviso
          </button>
        </div>
      </header>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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
          <h2 className="text-xl font-semibold text-slate-900">Avviso importante</h2>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-slate-700">
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
        <button
          type="button"
          onClick={acknowledge}
          className="btn-primary mt-6 w-full"
        >
          Ho letto e compreso
        </button>
      </div>
    </div>
  );
}
