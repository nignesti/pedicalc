/**
 * Tipi per la rappresentazione dei farmaci e dei calcoli di dosaggio.
 *
 * Il principio è tenere i dati dei farmaci separati dal motore di calcolo e dalla UI.
 * Ogni farmaco è descritto da una struttura dati pura — nessuna logica, solo configurazione.
 * Questo permette di:
 *   - aggiungere/modificare un farmaco in un solo posto
 *   - testare il motore di calcolo con casi sintetici
 *   - validare facilmente che non ci siano regressioni sui dosaggi
 */

/** Unità di misura del risultato di un calcolo. */
export type DoseUnit = 'mg' | 'mcg' | 'mL' | 'J' | 'gocce' | 'fiala' | 'fiale' | 'mEq';

/** Via di somministrazione. */
export type Route =
  | 'EV'
  | 'IO'
  | 'IM'
  | 'IN'
  | 'Rettale'
  | 'Aerosol'
  | 'EV/IO'
  | 'IM/IN/EV'
  | 'EV/IM'
  | 'EV/Rettale';

/**
 * Regola di calcolo per peso (formula lineare).
 * Dose = peso × factor, con eventuali limiti min/max e dose minima assoluta.
 */
export interface WeightBasedRule {
  kind: 'weight-based';
  /** Fattore mg/kg (o mcg/kg, mL/kg, J/kg — l'unità è in `unit`). */
  factor: number;
  /** Unità del risultato. */
  unit: DoseUnit;
  /** Via di somministrazione. */
  route: Route;
  /** Dose minima assoluta (il risultato non scende sotto questo valore). */
  minDose?: number;
  /** Dose massima assoluta (il risultato non sale sopra questo valore). */
  maxDose?: number;
  /** Numero di decimali nella visualizzazione. */
  decimals?: number;
  /** Note cliniche da mostrare in calce al risultato. */
  notes?: string;
}

/**
 * Regola di calcolo per peso come range (dose minima e massima per kg).
 * Es. Rocuronio 0.6 - 1.2 mg/kg.
 */
export interface WeightRangeRule {
  kind: 'weight-range';
  factorMin: number;
  factorMax: number;
  unit: DoseUnit;
  route: Route;
  maxDose?: number;
  decimals?: number;
  notes?: string;
}

/**
 * Dose discreta basata su fasce di peso.
 * Es. Glucagone: 0.5 mg se peso 5-24 kg, 1 mg se >= 25 kg.
 */
export interface WeightBandRule {
  kind: 'weight-band';
  bands: Array<{
    /** Peso minimo incluso (kg). */
    minKg: number;
    /** Peso massimo incluso (kg). undefined = nessun limite superiore. */
    maxKg?: number;
    /** Valore numerico della dose in quella fascia. Può essere undefined se si usa `displayValue`. */
    value?: number;
    /** Valore testuale per casi in cui la dose è espressa come intervallo (es. "12-14"). */
    displayValue?: string;
  }>;
  unit: DoseUnit;
  route: Route;
  decimals?: number;
  notes?: string;
  /** Messaggio se il peso non rientra in nessuna fascia. */
  outOfBandsMessage?: string;
}

/**
 * Regola composta basata su peso ed età.
 * Es. Metilprednisolone: dose per kg e dose massima dipendono dalla fascia d'età.
 */
export interface WeightAgeRule {
  kind: 'weight-age';
  bands: Array<{
    /** Età massima inclusa in anni. Usa Infinity per "senza limite superiore". */
    maxAgeYears: number;
    factor: number;
    maxDose: number;
    label: string;
  }>;
  unit: DoseUnit;
  route: Route;
  decimals?: number;
  notes?: string;
}

/**
 * Generazione di più scariche elettriche basate su peso (per defibrillazione/cardioversione).
 */
export interface ShockRule {
  kind: 'shock';
  shocks: Array<{
    label: string;
    factorMin: number;
    factorMax?: number;
    /** Dose massima assoluta in joule per questa scarica. */
    maxDose?: number;
  }>;
  unit: 'J';
  notes?: string;
}

/** Unione di tutte le regole di calcolo possibili. */
export type DosageRule =
  | WeightBasedRule
  | WeightRangeRule
  | WeightBandRule
  | WeightAgeRule
  | ShockRule;

/**
 * Un'indicazione clinica all'interno di un farmaco.
 * Alcuni farmaci hanno più indicazioni con dosaggi diversi
 * (es. Adrenalina ha ACR, Anafilassi, Croup).
 */
export interface Indication {
  id: string;
  label: string;
  description?: string;
  rule: DosageRule;
  /** Per farmaci che richiedono la scelta della via di somministrazione (es. Midazolam EV/IM/IN). */
  routeVariants?: Array<{ id: string; label: string; rule: DosageRule }>;
}

/** Un farmaco, come definito nei dati. */
export interface Drug {
  id: string;
  name: string;
  /** Categoria per ordinare/filtrare. */
  category?: 'farmaco' | 'elettricita' | 'liquidi';
  /** Indicazioni cliniche principali (per cosa si usa). */
  indications: Indication[];
  /** Eventuale nota generale sul farmaco. */
  generalNotes?: string;
  /**
   * Fonte del protocollo/dosaggio (es. "PALS 2020", "Protocollo reparto X").
   * Opzionale: non mostrata nell'UI in questa fase, predisposta per il futuro.
   */
  source?: string;
}
