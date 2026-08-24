import {
  gray,
  mauve,
  olive,
  sage,
  sand,
  slate,
} from '@radix-ui/colors';
import { generateRadixColors } from './radixColors';
import type { TokenDef, TokenLayerDef } from './types';

export type GrayTint = 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand';
export type RadiusChoice = 'none' | 'small' | 'medium' | 'large' | 'full';
export type ScalingChoice = 0.9 | 0.95 | 1 | 1.05 | 1.1;

export interface BrandDefinition {
  name: string;
  accentHex: string;
  /** Dark-mode accent override — monochrome brands (a near-black accent)
   *  anchor their dark scale to a light hex so solids stay visible on the
   *  dark background. Omitted = same accent in both modes. */
  darkAccentHex?: string;
  grayTint: GrayTint;
  radius: RadiusChoice;
  scaling: ScalingChoice;
  fontFamily: string;
  panelStyle: 'solid' | 'translucent';
}

export const RADIUS_FACTORS: Record<RadiusChoice, number> = {
  none: 0,
  small: 0.75,
  medium: 1,
  large: 1.5,
  full: 1.5,
};

const GRAY_SEED: Record<GrayTint, string> = {
  gray: gray.gray9,
  mauve: mauve.mauve9,
  slate: slate.slate9,
  sage: sage.sage9,
  olive: olive.olive9,
  sand: sand.sand9,
};

const LIGHT_BG = '#ffffff';
const DARK_BG = '#111113';

export function isValidHex(hex: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(hex.trim());
}

export function normalizeHex(hex: string): string {
  const h = hex.trim();
  return h.startsWith('#') ? h.toLowerCase() : `#${h.toLowerCase()}`;
}

/**
 * Layer 2 — the brand layer. Generates full light+dark accent and gray
 * scales from the brand hex (step 9 === the exact brand color) and maps the
 * semantic slots every component consumes. Library-specific semantic slots
 * (e.g. Volt's charger-status vocabulary) are appended via `extraTokens` —
 * this core stays UI-library-agnostic.
 */
export function buildSemanticTokens(
  brand: BrandDefinition,
  extraTokens: TokenDef[] = [],
): TokenLayerDef {
  if (!isValidHex(brand.accentHex)) {
    throw new Error(`Invalid brand accent hex: ${brand.accentHex}`);
  }
  if (brand.darkAccentHex && !isValidHex(brand.darkAccentHex)) {
    throw new Error(`Invalid brand dark accent hex: ${brand.darkAccentHex}`);
  }
  const accentHex = normalizeHex(brand.accentHex);
  const darkAccentHex = brand.darkAccentHex
    ? normalizeHex(brand.darkAccentHex)
    : accentHex;
  const graySeed = GRAY_SEED[brand.grayTint];

  const light = generateRadixColors({
    appearance: 'light',
    accent: accentHex,
    gray: graySeed,
    background: LIGHT_BG,
  });
  const dark = generateRadixColors({
    appearance: 'dark',
    accent: darkAccentHex,
    gray: graySeed,
    background: DARK_BG,
  });

  const tokens: TokenDef[] = [];

  for (let i = 0; i < 12; i++) {
    tokens.push({
      path: `accent.${i + 1}`,
      type: 'color',
      modes: { light: light.accentScale[i], dark: dark.accentScale[i] },
    });
    tokens.push({
      path: `accent.a${i + 1}`,
      type: 'color',
      modes: {
        light: light.accentScaleAlpha[i],
        dark: dark.accentScaleAlpha[i],
      },
    });
    tokens.push({
      path: `gray.${i + 1}`,
      type: 'color',
      modes: { light: light.grayScale[i], dark: dark.grayScale[i] },
    });
    tokens.push({
      path: `gray.a${i + 1}`,
      type: 'color',
      modes: {
        light: light.grayScaleAlpha[i],
        dark: dark.grayScaleAlpha[i],
      },
    });
  }

  tokens.push(
    {
      path: 'accent.contrast',
      type: 'color',
      description: 'Text on accent.9 fills',
      modes: { light: light.accentContrast, dark: dark.accentContrast },
    },
    {
      path: 'accent.surface',
      type: 'color',
      modes: { light: light.accentSurface, dark: dark.accentSurface },
    },

    {
      path: 'color.bg',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.1' },
    },
    {
      path: 'color.surface',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.2' },
    },
    {
      path: 'color.panel',
      type: 'color',
      modes:
        brand.panelStyle === 'translucent'
          ? { light: light.graySurface, dark: 'rgba(0, 0, 0, 0.25)' }
          : { light: '#ffffff', dark: dark.grayScale[1] },
    },
    {
      path: 'color.panel-blur',
      type: 'string',
      value: brand.panelStyle === 'translucent' ? 'blur(12px)' : 'none',
    },
    {
      path: 'color.overlay',
      type: 'color',
      modes: { light: 'rgba(0, 0, 0, 0.4)', dark: 'rgba(0, 0, 0, 0.6)' },
    },
    {
      path: 'color.text',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.12' },
    },
    {
      path: 'color.text-secondary',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.11' },
    },
    {
      path: 'color.border',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.6' },
    },
    {
      path: 'color.border-strong',
      type: 'color',
      alias: { layer: 'semantic', path: 'gray.8' },
    },
    {
      path: 'color.focus-ring',
      type: 'color',
      alias: { layer: 'semantic', path: 'accent.8' },
    },
  );

  tokens.push(
    { path: 'font.family', type: 'fontFamily', value: brand.fontFamily },
    // Brand-tier geometry and typography roles. Component tokens alias
    // these (never global primitives directly), so the chain is always
    // component → brand → primitive.
    {
      path: 'radius.small',
      type: 'dimension',
      alias: { layer: 'global', path: 'radius.2' },
    },
    {
      path: 'radius.interactive',
      type: 'dimension',
      alias: { layer: 'global', path: 'radius.3' },
    },
    {
      path: 'radius.container',
      type: 'dimension',
      alias: { layer: 'global', path: 'radius.4' },
    },
    {
      path: 'radius.overlay',
      type: 'dimension',
      alias: { layer: 'global', path: 'radius.5' },
    },
    {
      path: 'text.caption',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.1' },
    },
    {
      path: 'text.body',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.2' },
    },
    {
      path: 'text.label',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.3' },
    },
    {
      path: 'text.title',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.4' },
    },
    {
      path: 'text.heading',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.6' },
    },
    {
      path: 'text.display',
      type: 'dimension',
      alias: { layer: 'global', path: 'font-size.9' },
    },

    // Brand-tier motion roles: intent-level duration+easing pairs that
    // component motion tokens alias (component → brand → primitive), mirroring
    // the radius/text role pattern.
    {
      path: 'motion.interaction.duration',
      type: 'duration',
      description: 'Hover/press/toggle feedback',
      alias: { layer: 'global', path: 'duration.fast' },
    },
    {
      path: 'motion.interaction.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.standard' },
    },
    {
      path: 'motion.entrance.duration',
      type: 'duration',
      description: 'Surfaces appearing (sheets, drawers) — iOS sheet timing',
      alias: { layer: 'global', path: 'duration.slower' },
    },
    {
      path: 'motion.entrance.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.sheet' },
    },
    {
      path: 'motion.swap.duration',
      type: 'duration',
      description: 'Inner content changes (view morphs, toasts, step changes)',
      alias: { layer: 'global', path: 'duration.normal' },
    },
    {
      path: 'motion.swap.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.enter' },
    },
    {
      path: 'motion.exit.duration',
      type: 'duration',
      alias: { layer: 'global', path: 'duration.fast' },
    },
    {
      path: 'motion.exit.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.exit' },
    },
    {
      path: 'motion.progress.duration',
      type: 'duration',
      description: 'Value changes on meters (battery bar, SOC ring)',
      alias: { layer: 'global', path: 'duration.slow' },
    },
    {
      path: 'motion.progress.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.standard' },
    },
    {
      path: 'motion.emphasis.duration',
      type: 'duration',
      description: 'Attention pops (selection, pin bounce)',
      alias: { layer: 'global', path: 'duration.normal' },
    },
    {
      path: 'motion.emphasis.easing',
      type: 'string',
      alias: { layer: 'global', path: 'easing.spring' },
    },

    // Single-segment paths so the emitted names match the var(--ev-scaling)
    // and var(--ev-radius-factor) references baked into dimension calcs.
    {
      path: 'scaling',
      type: 'number',
      value: brand.scaling,
    },
    {
      path: 'radius-factor',
      type: 'number',
      value: RADIUS_FACTORS[brand.radius],
    },
    {
      path: 'radius-full',
      type: 'dimension',
      description: 'Pill-shape opt-in flag: 9999px only for the full radius brand setting',
      value: brand.radius === 'full' ? '9999px' : '0px',
    },
  );

  tokens.push(...extraTokens);

  return { layer: 'semantic', tokens };
}
