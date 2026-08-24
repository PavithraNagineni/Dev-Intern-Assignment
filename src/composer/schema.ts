import type { Data } from '@puckeditor/core';
import type { LibraryId } from '../libraries/types';
import type { BrandDefinition } from '../tokens/brand';
import { DEFAULT_PRESET } from '../theme/presets';
import { ATLAS_PRESETS } from '../libraries/atlas-web/tokens/presets';
import { ATLAS_CHARGE_PRESETS } from '../libraries/atlas-charge/tokens/presets';

/**
 * ComposerDoc is the ONLY persisted shape — a canvas-layer-agnostic envelope
 * around per-screen Puck documents. If the board layer ever changes (e.g. a
 * tldraw trial), screens and their content are untouched.
 */

export type ViewportKind = 'phone' | 'tablet' | 'desktop';

export const VIEWPORT_SIZES: Record<
  ViewportKind,
  { width: number; height: number }
> = {
  phone: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
};

export interface ComposerScreen {
  id: string;
  name: string;
  /** Board position (viewport-independent canvas units). */
  x: number;
  y: number;
  viewport: ViewportKind;
  puckData: Data;
}

export interface ComposerDoc {
  version: 2;
  /** The UI library this doc's component types resolve against. Docs never
   *  leak across libraries — storage is keyed per library too. */
  library: LibraryId;
  /** Brand snapshot for portability; the live ThemeProvider stays the source
   *  of truth while editing. */
  brand: BrandDefinition;
  screens: ComposerScreen[];
}

export const emptyPuckData = (): Data => ({
  content: [],
  root: { props: {} },
});

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

/** Cascade new screens left-to-right so they never stack. */
export function screenPosition(index: number): { x: number; y: number } {
  return { x: 80 + index * (VIEWPORT_SIZES.phone.width + 96), y: 80 };
}

export function newScreen(
  name: string,
  index: number,
  viewport: ViewportKind = 'phone',
): ComposerScreen {
  return {
    id: uid(),
    name,
    ...screenPosition(index),
    viewport,
    puckData: emptyPuckData(),
  };
}

export function defaultPresetFor(library: LibraryId): BrandDefinition {
  switch (library) {
    case 'atlas-web':
      return ATLAS_PRESETS[0];
    case 'atlas-charge':
      return ATLAS_CHARGE_PRESETS[0];
    case 'volt':
    default:
      return DEFAULT_PRESET;
  }
}

export function createDoc(
  library: LibraryId,
  brand?: BrandDefinition,
): ComposerDoc {
  return { version: 2, library, brand: brand ?? defaultPresetFor(library), screens: [] };
}

// ---------- pure screen operations (immutable) ----------

export function addScreen(
  doc: ComposerDoc,
  name: string,
  viewport: ViewportKind = 'phone',
): ComposerDoc {
  return {
    ...doc,
    screens: [...doc.screens, newScreen(name, doc.screens.length, viewport)],
  };
}

export function duplicateScreen(doc: ComposerDoc, id: string): ComposerDoc {
  const src = doc.screens.find((s) => s.id === id);
  if (!src) return doc;
  const copy: ComposerScreen = {
    ...structuredClone(src),
    id: uid(),
    name: `${src.name} copy`,
    x: src.x + 48,
    y: src.y + 48,
  };
  return { ...doc, screens: [...doc.screens, copy] };
}

export function renameScreen(
  doc: ComposerDoc,
  id: string,
  name: string,
): ComposerDoc {
  return patchScreen(doc, id, { name });
}

export function deleteScreen(doc: ComposerDoc, id: string): ComposerDoc {
  return { ...doc, screens: doc.screens.filter((s) => s.id !== id) };
}

export function patchScreen(
  doc: ComposerDoc,
  id: string,
  patch: Partial<ComposerScreen>,
): ComposerDoc {
  return {
    ...doc,
    screens: doc.screens.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  };
}

// ---------- persistence ----------

export const storageKeyFor = (library: LibraryId): string =>
  `prism-ui-composer-doc:${library}`;

/** Docs saved under former app names, newest first — read-once fallbacks,
 *  never written. */
const LEGACY_KEYS: Record<LibraryId, string[]> = {
  volt: ['vector-composer-doc:volt', 'volt-composer-doc'],
  'atlas-web': ['vector-composer-doc:atlas-web'],
  'atlas-charge': [],
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export function saveDoc(
  doc: ComposerDoc,
  storage: StorageLike = localStorage,
): void {
  try {
    storage.setItem(storageKeyFor(doc.library), JSON.stringify(doc));
  } catch {
    // best-effort persistence
  }
}

export function parseDoc(raw: string): ComposerDoc | null {
  try {
    const parsed = JSON.parse(raw) as Omit<ComposerDoc, 'version'> & {
      version: number;
    };
    if (!Array.isArray(parsed?.screens) || !parsed.brand?.accentHex) {
      return null;
    }
    if (parsed.version === 2 && parsed.library) {
      return { ...parsed, version: 2 };
    }
    if (parsed.version === 1) {
      // v1 docs predate UI libraries — they are all volt.
      return { ...parsed, version: 2, library: 'volt' };
    }
    return null;
  } catch {
    return null;
  }
}

export function loadDoc(
  library: LibraryId,
  storage: StorageLike = localStorage,
): ComposerDoc | null {
  const keys = [storageKeyFor(library), ...(LEGACY_KEYS[library] ?? [])];
  for (const key of keys) {
    if (!key) continue;
    const raw = storage.getItem(key);
    const doc = raw ? parseDoc(raw) : null;
    if (doc && doc.library === library) return doc;
  }
  return null;
}
