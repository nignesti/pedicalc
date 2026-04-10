/**
 * Contesto globale per il profilo paziente.
 * Persiste in localStorage: peso, età e unità età.
 * Condiviso tra DrugDetailPage, VitalSignsPage e DevicesPage.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export type AgeUnit = 'anni' | 'mesi';

interface PatientProfile {
  weight: string;
  age: string;
  ageUnit: AgeUnit;
}

interface PatientContextValue extends PatientProfile {
  setWeight: (v: string) => void;
  setAge: (v: string) => void;
  setAgeUnit: (v: AgeUnit) => void;
  reset: () => void;
}

const STORAGE_KEY = 'pedicalc-patient';

function loadFromStorage(): PatientProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { weight: '', age: '', ageUnit: 'anni' };
    const parsed = JSON.parse(raw) as Partial<PatientProfile>;
    return {
      weight: typeof parsed.weight === 'string' ? parsed.weight : '',
      age: typeof parsed.age === 'string' ? parsed.age : '',
      ageUnit: parsed.ageUnit === 'mesi' ? 'mesi' : 'anni',
    };
  } catch {
    return { weight: '', age: '', ageUnit: 'anni' };
  }
}

function saveToStorage(profile: PatientProfile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage non disponibile — nessun crash
  }
}

const PatientContext = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile>(loadFromStorage);

  const update = useCallback((patch: Partial<PatientProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  const EMPTY: PatientProfile = { weight: '', age: '', ageUnit: 'anni' };

  return (
    <PatientContext.Provider
      value={{
        ...profile,
        setWeight: (v) => update({ weight: v }),
        setAge: (v) => update({ age: v }),
        setAgeUnit: (v) => update({ ageUnit: v }),
        reset: () => {
          setProfile(EMPTY);
          try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
        },
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used inside PatientProvider');
  return ctx;
}
