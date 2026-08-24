import React, {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { BrandDefinition } from '../tokens/brand';
import { buildSemanticTokens } from '../tokens/brand';
import { applyVars, emitLayer, mergeEmitted } from '../tokens/emit';
import { GLOBAL_TOKENS } from '../tokens/global';
import type { EmittedVars, TokenLayerDef } from '../tokens/types';
import { DEFAULT_PRESET } from './presets';

export type Appearance = 'light' | 'dark';

export interface ThemeContextValue {
  brand: BrandDefinition;
  setBrand: (brand: BrandDefinition) => void;
  appearance: Appearance;
  setAppearance: (appearance: Appearance) => void;
  /** Resolved layer definitions, for the token inspector and DTCG export. */
  layers: TokenLayerDef[];
  emitted: EmittedVars;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

interface PersistedState {
  brand: BrandDefinition;
  appearance: Appearance;
}

function loadPersisted(
  storageKey: string,
  legacyStorageKeys: string[],
  defaultPreset: BrandDefinition,
): PersistedState {
  for (const key of [storageKey, ...legacyStorageKeys]) {
    if (!key) continue;

    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;

        if (parsed.brand?.accentHex && parsed.appearance) {
          return parsed;
        }
      }
    } catch {
  
    }
  }

  return {
    brand: defaultPreset,
    appearance: 'light',
  };
}

export function ThemeProvider({
  globalTokens = GLOBAL_TOKENS,
  buildSemantic = buildSemanticTokens,
  defaultPreset = DEFAULT_PRESET,
  storageKey = 'prism-ui-theme:volt',
  legacyStorageKeys = [],
  extraLayers = [],
  children,
}: {
  globalTokens?: TokenLayerDef;


  buildSemantic?: (brand: BrandDefinition) => TokenLayerDef;

  defaultPreset?: BrandDefinition;

  storageKey?: string;

  legacyStorageKeys?: string[];

  extraLayers?: TokenLayerDef[];

  children: React.ReactNode;
}) {
  const [persisted] = useState(() =>
    loadPersisted(storageKey, legacyStorageKeys, defaultPreset),
  );

  const [brand, setBrand] = useState<BrandDefinition>(persisted.brand);

  const [appearance, setAppearance] = useState<Appearance>(
    persisted.appearance,
  );

  useEffect(() => {
    const p = loadPersisted(storageKey, legacyStorageKeys, defaultPreset);
    setBrand(p.brand);
    setAppearance(p.appearance);
  }, [storageKey, defaultPreset]);

  const semantic = useMemo(
    () => buildSemantic(brand),
    [buildSemantic, brand],
  );

  const layers = useMemo(
    () => [globalTokens, semantic, ...extraLayers],
    [globalTokens, semantic, extraLayers],
  );

  const emitted = useMemo(
    () => mergeEmitted(...layers.map(emitLayer)),
    [layers],
  );

  useEffect(() => {
    const el = document.documentElement;

    applyVars(el, emitted.base);
    applyVars(
      el,
      appearance === 'light' ? emitted.light : emitted.dark,
    );

    el.classList.remove('light', 'dark');
    el.classList.add(appearance);
  }, [emitted, appearance]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          brand,
          appearance,
        } satisfies PersistedState),
      );
    } catch {
      // Persistence is best-effort.
    }
  }, [storageKey, brand, appearance]);

  const value = useMemo(
    () => ({
      brand,
      setBrand,
      appearance,
      setAppearance,
      layers,
      emitted,
    }),
    [brand, appearance, layers, emitted],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div className="ev-theme">{children}</div>
    </ThemeContext.Provider>
  );
}