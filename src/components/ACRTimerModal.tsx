/**
 * Timer ACR — modal full-screen.
 * - Cronometro principale (tempo totale)
 * - Countdown "prossima adrenalina tra X" (alert ogni 3 min)
 * - Pulsanti rapidi per registrare eventi (adrenalina, shock, amiodarone, atropina)
 * - Timeline cronologica
 * - Pausa / Termina / Condividi riepilogo (Web Share API + fallback clipboard)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ACRTimerModalProps {
  onClose: () => void;
  weightKg?: number;
}

type EventType = 'adrenalina' | 'amiodarone' | 'atropina' | 'shock';

interface TimelineEvent {
  type: EventType;
  label: string;
  at: number; // ms since epoch
  elapsed: number; // ms from start (al netto delle pause)
}

const ADRENALINE_INTERVAL_MS = 3 * 60 * 1000; // 3 min
const ADRENALINE_ALERT_WINDOW_MS = 30 * 1000; // flash visivo dopo scadenza

function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

function beep() {
  try {
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
    // chiude il context dopo per non lasciare risorse pendenti
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch {
    // silenzioso
  }
}

function vibrate() {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([300, 150, 300, 150, 300]);
    } catch { /* noop */ }
  }
}

function buildSummary(
  startedAt: number,
  elapsedMs: number,
  events: TimelineEvent[],
  weightKg?: number
): string {
  const dt = new Date(startedAt);
  const dstr = dt.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
  const lines: string[] = [];
  lines.push(`ACR — Riepilogo evento`);
  lines.push(`Inizio: ${dstr}`);
  if (weightKg) lines.push(`Peso: ${weightKg} kg`);
  lines.push(`Durata totale: ${formatTime(elapsedMs)}`);
  lines.push('');
  lines.push('Cronologia interventi:');
  if (events.length === 0) {
    lines.push('  (nessun intervento registrato)');
  } else {
    for (const e of events) {
      lines.push(`  [${formatTime(e.elapsed)}] ${e.label}`);
    }
  }
  lines.push('');
  lines.push('Generato da PediCalc');
  return lines.join('\n');
}

export function ACRTimerModal({ onClose, weightKg }: ACRTimerModalProps) {
  const [startedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [paused, setPaused] = useState(false);
  const [pauseOffset, setPauseOffset] = useState(0); // ms totali di pausa
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const alertedForRef = useRef<number | null>(null);

  // Tick ogni 250ms quando in running
  useEffect(() => {
    if (paused || showSummary) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [paused, showSummary]);

  // Elapsed al netto delle pause
  const elapsedMs = paused && pausedAt !== null
    ? pausedAt - startedAt - pauseOffset
    : now - startedAt - pauseOffset;

  // Ultima adrenalina
  const lastAdrenaline = [...events].reverse().find((e) => e.type === 'adrenalina');
  const nextAdrenalineIn =
    lastAdrenaline === undefined
      ? null
      : ADRENALINE_INTERVAL_MS - (elapsedMs - lastAdrenaline.elapsed);

  const alertActive =
    nextAdrenalineIn !== null &&
    nextAdrenalineIn <= 0 &&
    -nextAdrenalineIn <= ADRENALINE_ALERT_WINDOW_MS &&
    !paused;

  // Suona beep + vibra al primo tick di alert per ciascuna adrenalina
  useEffect(() => {
    if (!alertActive || !lastAdrenaline) return;
    const key = lastAdrenaline.at;
    if (alertedForRef.current === key) return;
    alertedForRef.current = key;
    beep();
    vibrate();
  }, [alertActive, lastAdrenaline]);

  const addEvent = useCallback(
    (type: EventType, label: string) => {
      if (paused) return;
      const at = Date.now();
      const elapsed = at - startedAt - pauseOffset;
      setEvents((prev) => [...prev, { type, label, at, elapsed }]);
    },
    [paused, startedAt, pauseOffset]
  );

  function togglePause() {
    if (paused) {
      const delta = Date.now() - (pausedAt ?? Date.now());
      setPauseOffset((o) => o + delta);
      setPausedAt(null);
      setPaused(false);
    } else {
      setPausedAt(Date.now());
      setPaused(true);
    }
  }

  function terminate() {
    setShowSummary(true);
  }

  const summary = buildSummary(startedAt, elapsedMs, events, weightKg);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ACR PediCalc', text: summary });
        return;
      }
    } catch {
      // l'utente può aver annullato
    }
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* noop */ }
  }

  function requestClose() {
    if (events.length === 0 && elapsedMs < 5000) {
      // appena aperto, chiusura immediata
      onClose();
    } else if (showSummary) {
      onClose();
    } else {
      setShowCloseConfirm(true);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 pt-safe text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Timer ACR"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-300">Timer ACR</h2>
        </div>
        <button
          type="button"
          onClick={requestClose}
          className="text-sm text-slate-300 hover:text-white"
        >
          ✕ Chiudi
        </button>
      </div>

      {showSummary ? (
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-safe-or-4">
          <h3 className="mb-3 text-lg font-bold">Riepilogo evento</h3>
          <pre className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-relaxed text-slate-100">
            {summary}
          </pre>
          {copied && (
            <p className="mt-3 text-center text-sm text-emerald-400">✓ Copiato negli appunti</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={share}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold hover:bg-brand-500"
            >
              Condividi / Copia
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700"
            >
              Chiudi
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cronometro */}
          <div
            className={`flex flex-col items-center justify-center gap-1 px-4 py-6 transition ${
              alertActive ? 'animate-pulse bg-rose-700' : 'bg-slate-900'
            }`}
          >
            <p className="text-xs uppercase tracking-widest text-slate-400">Tempo totale</p>
            <p className="font-mono text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
              {formatTime(elapsedMs)}
            </p>
            <div className="mt-1 h-6">
              {nextAdrenalineIn !== null && (
                <p className={`text-sm font-semibold ${alertActive ? 'text-white' : 'text-rose-300'}`}>
                  {nextAdrenalineIn > 0
                    ? `Prossima adrenalina tra ${formatTime(nextAdrenalineIn)}`
                    : `⚠ Adrenalina scaduta da ${formatTime(-nextAdrenalineIn)}`}
                </p>
              )}
              {nextAdrenalineIn === null && (
                <p className="text-xs text-slate-500">
                  Tocca "Adrenalina" per avviare il conto alla rovescia
                </p>
              )}
            </div>
            {paused && (
              <p className="mt-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-amber-950">
                PAUSA
              </p>
            )}
          </div>

          {/* Bottoni evento */}
          <div className="grid grid-cols-2 gap-2 px-4 py-3">
            <ActionBtn
              label="Adrenalina"
              onClick={() => addEvent('adrenalina', 'Adrenalina')}
              color="bg-rose-600 hover:bg-rose-500 active:bg-rose-700"
              disabled={paused}
            />
            <ActionBtn
              label="Shock"
              onClick={() => addEvent('shock', 'Scarica')}
              color="bg-orange-600 hover:bg-orange-500 active:bg-orange-700"
              disabled={paused}
            />
            <ActionBtn
              label="Amiodarone"
              onClick={() => addEvent('amiodarone', 'Amiodarone')}
              color="bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700"
              disabled={paused}
            />
            <ActionBtn
              label="Atropina"
              onClick={() => addEvent('atropina', 'Atropina')}
              color="bg-lime-600 hover:bg-lime-500 active:bg-lime-700"
              disabled={paused}
            />
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto px-4 pb-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Cronologia</p>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">Nessun evento ancora registrato.</p>
            ) : (
              <ol className="space-y-1">
                {[...events].reverse().map((e, idx) => (
                  <li
                    key={`${e.at}-${idx}`}
                    className="flex items-baseline justify-between gap-3 rounded-lg bg-slate-800/70 px-3 py-2"
                  >
                    <span className="text-sm">{e.label}</span>
                    <span className="font-mono text-xs tabular-nums text-slate-300">
                      {formatTime(e.elapsed)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Controlli */}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 px-4 py-3 pb-safe-or-4">
            <button
              type="button"
              onClick={togglePause}
              className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-600"
            >
              {paused ? '▶ Riprendi' : '⏸ Pausa'}
            </button>
            <button
              type="button"
              onClick={terminate}
              className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold hover:bg-red-600"
            >
              ■ Termina
            </button>
          </div>
        </>
      )}

      {/* Conferma chiusura */}
      {showCloseConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold">Chiudere il timer ACR?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Il timer è in corso. Chiudendo perderai il cronometro e gli eventi registrati.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-600"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-600"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  color,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-4 text-base font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${color}`}
    >
      + {label}
    </button>
  );
}
