/**
 * Timer ACR — modal full-screen.
 *
 * Logica alert adrenalina:
 * - Countdown scade → 3 lampeggi + 3 beep + vibrazione
 * - Dopo i lampeggi: scritta fissa "Somministra adrenalina" (nessun pulse)
 * - Al click su Adrenalina: torna "Prossima tra X:XX"
 *
 * Etichette sequenziali: Prima/Seconda/Terza Adrenalina, Primo/Secondo Shock, ecc.
 *
 * ROSC: registra "ROSC — ACR totale: MM:SS" in timeline,
 *       azzera il display e mostra "Tempo dal ROSC".
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface ACRTimerModalProps {
  onClose: () => void;
  weightKg?: number;
}

type EventType = 'adrenalina' | 'amiodarone' | 'shock' | 'rosc';

interface TimelineEvent {
  type: EventType;
  label: string;
  at: number;      // ms epoch
  elapsed: number; // ms from start, al netto delle pause
}

interface RoscInfo {
  timestamp: number;         // Date.now() al momento del ROSC
  pauseOffsetAtROSC: number; // pauseOffset accumulato fino al ROSC
  acrElapsed: number;        // elapsed ACR al momento del ROSC
}

const ADRENALINE_INTERVAL_MS = 3 * 60 * 1000; // 3 min
const FLASH_DURATION_MS      = 1500;           // 3 lampeggi × 500ms
const FLASH_STEP_MS          = 250;            // ogni step cambia stato on/off

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  if (ms < 0) ms = 0;
  const sec = Math.floor(ms / 1000);
  const mm = Math.floor(sec / 60).toString().padStart(2, '0');
  const ss = (sec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Etichetta ordinale italiana per adrenalina/amiodarone/shock */
function ordinalLabel(type: 'adrenalina' | 'amiodarone' | 'shock', count: number): string {
  const ORDINALS: Record<number, { f: string; m: string }> = {
    1: { f: 'Prima',  m: 'Primo'  },
    2: { f: 'Seconda', m: 'Secondo' },
    3: { f: 'Terza',  m: 'Terzo'  },
    4: { f: 'Quarta', m: 'Quarto' },
    5: { f: 'Quinta', m: 'Quinto' },
    6: { f: 'Sesta',  m: 'Sesto'  },
  };
  const gender = type === 'adrenalina' ? 'f' : 'm';
  const ord    = ORDINALS[count];
  const prefix = ord ? ord[gender] : `${count}°`;
  return `${prefix} ${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function beep() {
  try {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx  = new Ctx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.55);
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch { /* noop */ }
}

function buildSummary(
  startedAt: number,
  elapsedMs: number,
  events: TimelineEvent[],
  weightKg?: number
): string {
  const dstr = new Date(startedAt).toLocaleString('it-IT', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const lines: string[] = [
    'ACR — Riepilogo evento',
    `Inizio: ${dstr}`,
    ...(weightKg ? [`Peso: ${weightKg} kg`] : []),
    `Durata totale: ${formatTime(elapsedMs)}`,
    '',
    'Cronologia interventi:',
    ...(events.length === 0
      ? ['  (nessun intervento registrato)']
      : events.map((e) => `  [${formatTime(e.elapsed)}] ${e.label}`)),
    '',
    'Generato da PediCalc',
  ];
  return lines.join('\n');
}

// ─── dosi ACR da peso ────────────────────────────────────────────────────────

function fmtMg(mg: number): string {
  // Mostra fino a 2 decimali, rimuove zeri finali inutili
  const s = mg.toFixed(2);
  return parseFloat(s) + ' mg';
}

function calcACRDoses(kg: number): { adrenalina: string; shock: string; amiodarone: string } {
  const adr = Math.min(kg * 0.01, 1);
  const shock = Math.min(Math.round(kg * 4), 360);
  const amio = Math.min(Math.round(kg * 5), 300);
  return {
    adrenalina: fmtMg(adr),
    shock: `${shock} J`,
    amiodarone: `${amio} mg`,
  };
}

// ─── componente ─────────────────────────────────────────────────────────────

export function ACRTimerModal({ onClose, weightKg }: ACRTimerModalProps) {
  const [startedAt]       = useState<number>(() => Date.now());
  const [now, setNow]      = useState<number>(() => Date.now());
  const [paused, setPaused]               = useState(false);
  const [pauseOffset, setPauseOffset]     = useState(0);
  const [pausedAt, setPausedAt]           = useState<number | null>(null);
  const [events, setEvents]               = useState<TimelineEvent[]>([]);
  const [roscInfo, setRoscInfo]           = useState<RoscInfo | null>(null);
  const [flashStart, setFlashStart]       = useState<number | null>(null); // epoch inizio flash
  const [showSummary, setShowSummary]     = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [copied, setCopied]               = useState(false);

  const alertedForRef = useRef<number | null>(null); // lastAdrenaline.at per cui l'alert è già scattato

  // ── tick ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (paused || showSummary) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [paused, showSummary]);

  // ── elapsed ACR totale ────────────────────────────────────────────────────
  const elapsedMs =
    paused && pausedAt !== null
      ? pausedAt - startedAt - pauseOffset
      : now - startedAt - pauseOffset;

  // ── elapsed mostrato (totale o dal ROSC) ─────────────────────────────────
  const displayElapsed = roscInfo
    ? Math.max(
        0,
        (paused && pausedAt !== null ? pausedAt : now) -
          roscInfo.timestamp -
          (pauseOffset - roscInfo.pauseOffsetAtROSC)
      )
    : elapsedMs;

  const timerLabel = roscInfo ? 'Tempo dal ROSC' : 'Tempo totale';

  // ── adrenalina countdown ──────────────────────────────────────────────────
  const lastAdrenaline = [...events].reverse().find((e) => e.type === 'adrenalina');
  const nextAdrenalineIn =
    lastAdrenaline === undefined || roscInfo !== null
      ? null
      : ADRENALINE_INTERVAL_MS - (elapsedMs - lastAdrenaline.elapsed);

  const needsAdrenaline = nextAdrenalineIn !== null && nextAdrenalineIn <= 0;

  // ── lampeggio (3 blinks × 500ms = 1500ms totali) ─────────────────────────
  const isInFlashWindow = flashStart !== null && now < flashStart + FLASH_DURATION_MS;
  const flashBlink =
    isInFlashWindow &&
    Math.floor((now - flashStart!) / FLASH_STEP_MS) % 2 === 0;

  // ── scatta alert una volta per ciascuna "scadenza" adrenalina ────────────
  useEffect(() => {
    if (!needsAdrenaline || !lastAdrenaline || paused) return;
    const key = lastAdrenaline.at;
    if (alertedForRef.current === key) return;
    alertedForRef.current = key;

    // 3 beep
    beep();
    setTimeout(beep, 500);
    setTimeout(beep, 1000);
    // vibrazione (3 impulsi)
    try { navigator.vibrate([300, 200, 300, 200, 300]); } catch { /* noop */ }
    // lampeggio
    setFlashStart(Date.now());
    setTimeout(() => setFlashStart(null), FLASH_DURATION_MS);
  }, [needsAdrenaline, lastAdrenaline, paused]);

  // ── aggiungi evento (con etichetta ordinale) ──────────────────────────────
  const addEvent = useCallback(
    (type: 'adrenalina' | 'amiodarone' | 'shock') => {
      if (paused) return;
      const at = Date.now();
      const elapsed = at - startedAt - pauseOffset;
      setEvents((prev) => {
        const count = prev.filter((e) => e.type === type).length + 1;
        const label = ordinalLabel(type, count);
        return [...prev, { type, label, at, elapsed }];
      });
    },
    [paused, startedAt, pauseOffset]
  );

  // ── ROSC ──────────────────────────────────────────────────────────────────
  const pressROSC = useCallback(() => {
    if (paused) return;
    const at = Date.now();
    const elapsed = at - startedAt - pauseOffset;
    const label = `ROSC — ACR totale: ${formatTime(elapsed)}`;
    setEvents((prev) => [...prev, { type: 'rosc', label, at, elapsed }]);
    setRoscInfo({ timestamp: at, pauseOffsetAtROSC: pauseOffset, acrElapsed: elapsed });
  }, [paused, startedAt, pauseOffset]);

  // ── pausa ─────────────────────────────────────────────────────────────────
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

  // ── chiusura ──────────────────────────────────────────────────────────────
  function requestClose() {
    if (showSummary || (events.length === 0 && elapsedMs < 5000)) {
      onClose();
    } else {
      setShowCloseConfirm(true);
    }
  }

  // ── riepilogo condivisibile ───────────────────────────────────────────────
  const summary = buildSummary(startedAt, elapsedMs, events, weightKg);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ACR PediCalc', text: summary });
        return;
      }
    } catch { /* annullato */ }
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* noop */ }
  }

  // ── sfondo area cronometro ────────────────────────────────────────────────
  const clockBg = flashBlink
    ? 'bg-rose-700'
    : roscInfo
    ? 'bg-emerald-950'
    : 'bg-slate-900';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 pt-safe text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Timer ACR"
    >
      {/* ── header ── */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
              className="h-4 w-4" aria-hidden="true">
              <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-300">Timer ACR</h2>
        </div>
        <button type="button" onClick={requestClose} className="text-sm text-slate-300 hover:text-white">
          ✕ Chiudi
        </button>
      </div>

      {showSummary ? (
        /* ── riepilogo ── */
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-safe-or-4">
          <h3 className="mb-3 text-lg font-bold">Riepilogo evento</h3>
          <pre className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-800 p-4 font-mono text-sm leading-relaxed text-slate-100">
            {summary}
          </pre>
          {copied && (
            <p className="mt-3 text-center text-sm text-emerald-400">✓ Copiato negli appunti</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={share}
              className="flex-1 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold hover:bg-brand-500">
              Condividi / Copia
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold hover:bg-slate-700">
              Chiudi
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── cronometro ── */}
          <div className={`flex flex-col items-center justify-center gap-1 px-4 py-6 transition-colors duration-100 ${clockBg}`}>
            <p className="text-xs uppercase tracking-widest text-slate-400">{timerLabel}</p>
            <p className="font-mono text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
              {formatTime(displayElapsed)}
            </p>

            {/* roscInfo: mostra ACR totale sotto */}
            {roscInfo && (
              <p className="mt-1 text-xs text-emerald-400">
                ACR totale: {formatTime(roscInfo.acrElapsed)}
              </p>
            )}

            {/* adrenalina countdown / alert */}
            <div className="mt-1 min-h-6">
              {!roscInfo && nextAdrenalineIn !== null && nextAdrenalineIn > 0 && (
                <p className="text-sm font-semibold text-rose-300">
                  Prossima adrenalina tra {formatTime(nextAdrenalineIn)}
                </p>
              )}
              {!roscInfo && needsAdrenaline && !isInFlashWindow && (
                <p className="text-sm font-bold text-amber-300">
                  ⚠ Somministra adrenalina
                </p>
              )}
              {!roscInfo && nextAdrenalineIn === null && !paused && (
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

          {/* ── bottoni evento ── */}
          {(() => {
            const doses = weightKg ? calcACRDoses(weightKg) : null;
            return (
              <div className="grid grid-cols-2 gap-2 px-4 py-3">
                <ActionBtn
                  label="Adrenalina"
                  sublabel={doses?.adrenalina}
                  onClick={() => addEvent('adrenalina')}
                  color="bg-rose-600 hover:bg-rose-500 active:bg-rose-700"
                  disabled={paused}
                />
                <ActionBtn
                  label="Shock"
                  sublabel={doses?.shock}
                  onClick={() => addEvent('shock')}
                  color="bg-orange-600 hover:bg-orange-500 active:bg-orange-700"
                  disabled={paused}
                />
                <ActionBtn
                  label="Amiodarone"
                  sublabel={doses?.amiodarone}
                  onClick={() => addEvent('amiodarone')}
                  color="bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700"
                  disabled={paused}
                />
                <ActionBtn
                  label="ROSC"
                  onClick={pressROSC}
                  color="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700"
                  disabled={paused}
                />
              </div>
            );
          })()}

          {/* ── timeline ── */}
          <div className="flex-1 overflow-y-auto px-4 pb-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Cronologia</p>
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">Nessun evento ancora registrato.</p>
            ) : (
              <ol className="space-y-1">
                {[...events].reverse().map((e, idx) => (
                  <li
                    key={`${e.at}-${idx}`}
                    className={`flex items-baseline justify-between gap-3 rounded-lg px-3 py-2 ${
                      e.type === 'rosc'
                        ? 'bg-emerald-900/60'
                        : 'bg-slate-800/70'
                    }`}
                  >
                    <span className={`text-sm font-medium ${e.type === 'rosc' ? 'text-emerald-300' : ''}`}>
                      {e.label}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-slate-300">
                      {formatTime(e.elapsed)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* ── controlli ── */}
          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 px-4 py-3 pb-safe-or-4">
            <button type="button" onClick={togglePause}
              className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold hover:bg-slate-600">
              {paused ? '▶ Riprendi' : '⏸ Pausa'}
            </button>
            <button type="button" onClick={() => setShowSummary(true)}
              className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold hover:bg-red-600">
              ■ Termina
            </button>
          </div>
        </>
      )}

      {/* ── conferma chiusura ── */}
      {showCloseConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-5 shadow-2xl">
            <h3 className="text-base font-bold">Chiudere il timer ACR?</h3>
            <p className="mt-2 text-sm text-slate-300">
              Il timer è in corso. Chiudendo perderai il cronometro e gli eventi registrati.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setShowCloseConfirm(false)}
                className="rounded-xl border border-slate-600 bg-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-600">
                Annulla
              </button>
              <button type="button" onClick={onClose}
                className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-600">
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
  label, sublabel, onClick, color, disabled = false,
}: {
  label: string;
  sublabel?: string;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center rounded-xl px-4 py-3 text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${color}`}
    >
      <span className="text-base font-bold leading-tight">
        {label === 'ROSC' ? '✓ ROSC' : `+ ${label}`}
      </span>
      {sublabel && (
        <span className="mt-0.5 text-sm font-semibold opacity-90 tabular-nums">
          {sublabel}
        </span>
      )}
    </button>
  );
}
