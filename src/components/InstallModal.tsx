interface InstallModalProps {
  onClose: () => void;
}

export function InstallModal({ onClose }: InstallModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-slate-950/80"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Aggiungi alla schermata Home
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Usala come un'app vera — si apre a schermo intero e funziona offline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Chiudi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* iOS */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white dark:text-slate-900" aria-hidden="true">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.78 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">iPhone / iPad</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">(Safari)</span>
          </div>
          <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">1</span>
              Apri questa pagina in <strong>Safari</strong>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">2</span>
              Tocca il pulsante di condivisione <strong>↑</strong> in basso
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">3</span>
              Scorri e seleziona <strong>"Aggiungi a schermata Home"</strong>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">4</span>
              Conferma con <strong>"Aggiungi"</strong>
            </li>
          </ol>
        </div>

        {/* Android */}
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden="true">
                <path d="M17.523 15.341A7.003 7.003 0 0 0 19 11a7 7 0 0 0-14 0 7.003 7.003 0 0 0 1.477 4.341L5 17h14l-1.477-1.659ZM3 11a9 9 0 1 1 18 0A9 9 0 0 1 3 11Zm7 9h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1Z"/>
              </svg>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100">Android</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">(Chrome)</span>
          </div>
          <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">1</span>
              Apri questa pagina in <strong>Chrome</strong>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">2</span>
              Tocca i tre puntini <strong>⋮</strong> in alto a destra
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">3</span>
              Seleziona <strong>"Aggiungi a schermata Home"</strong> o <strong>"Installa app"</strong>
            </li>
            <li className="flex gap-2">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">4</span>
              Conferma con <strong>"Installa"</strong>
            </li>
          </ol>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Una volta installata, PediCalc è disponibile anche senza connessione internet.
        </p>
      </div>
    </div>
  );
}
