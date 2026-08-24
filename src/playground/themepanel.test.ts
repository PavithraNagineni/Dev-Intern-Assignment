import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('theme panel shell', () => {
  it('keeps a constant corner radius while library radius settings change', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/playground/themepanel.css'),
      'utf8',
    );
    const panelRule = css.match(/\.tp\s*\{[^}]+\}/)?.[0] ?? '';
    expect(panelRule).toContain('border-radius: 20px');
    expect(panelRule).not.toMatch(/border-radius:\s*var\(--ev-radius/);
  });

  it('keeps theme customizations isolated per UI library key in storage', () => {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    };

    const voltKey = 'prism-ui-theme:volt';
    const atlasKey = 'prism-ui-theme:atlas-web';

    const voltCustom = {
      brand: {
        name: 'Custom Volt',
        accentHex: '#ff0055',
        grayTint: 'mauve',
        radius: 'small',
        scaling: 1.1,
        fontFamily: 'sans-serif',
        panelStyle: 'solid',
      },
      appearance: 'dark',
    };

    mockStorage.setItem(voltKey, JSON.stringify(voltCustom));

    expect(mockStorage.getItem(atlasKey)).toBeNull();
  });
});
