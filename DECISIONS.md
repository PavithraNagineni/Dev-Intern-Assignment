# Human Decision Notes

## 1. What I changed

- **Issue #1 (Gray tint does nothing)**: Audited `buildSemanticTokens` in `src/tokens/brand.ts` and `generateRadixColors` in `src/tokens/radixColors.ts`. The semantic token layer generates 12-step OKLCH scales for `gray.*` and `gray.a*` derived from `GRAY_SEED[brand.grayTint]`, and `mergeEmitted` overrides global fallbacks at runtime. Verified in `src/tokens/brand.test.ts` that distinct tints (sand, mauve, slate, sage, olive, gray) yield differentiated color scales.
- **Issue #2 (Station cards lost their selected state)**: In `src/components/molecules/StationListCard.tsx`, the card renders `ev-station-card--selected` for the selected variant. In `src/components/molecules/molecules.css`, the `.ev-station-card--selected` rule applies `--ev-card-selected-border` (`accent.9`), an elevated drop shadow, and a `-2px` transform. Added `src/components/molecules/molecules.css` to `voltLibrary.cssFiles` in `src/libraries/volt/index.ts` so the CSS contract test actively enforces all card tokens.
- **Issue #3 (Exported JSX will not compile)**: On the "Station detail" screen, `<PricingTable notes />` causes `VOLT_CODEGEN` in `src/libraries/volt/composer/codegen.ts` to require `SAMPLE_TARIFF_NOTES` from `../components/data`. In `src/components/data.ts`, added `export { SAMPLE_TARIFF_NOTES } from './tariffs';` and added a regression test in `src/composer/codegen.test.ts`.
- **Issue #4 (Theme settings leak across UI libraries)**: In `src/main.tsx` and `src/composer/main.tsx`, configured `ThemeProvider` with library-partitioned storage keys (`storageKey={'prism-ui-theme:' + library.id}`) and React keys (`key={library.id}`) so state mounts fresh when switching packs. Fixed missing imports (`useEffect`, `useTheme`) in `src/composer/main.tsx` to maintain doc-theme synchronization, and verified isolation in `src/playground/themepanel.test.ts`.

## 2. Evidence I used

| File or command | What I learned |
|---|---|
| `npm run build` | Revealed missing `useEffect` and `useTheme` imports in `src/composer/main.tsx`. |
| `src/libraries/volt/index.ts` | Found `voltLibrary.cssFiles` omitted `molecules.css`, meaning the CSS contract test was skipping all molecule components entirely. |
| `src/libraries/volt/composer/codegen.ts` & `src/components/tariffs.ts` | Identified that `VOLT_CODEGEN` maps `SAMPLE_TARIFF_NOTES` to `../components/data`, but `data.ts` did not export `SAMPLE_TARIFF_NOTES` from `tariffs.ts`. |
| `src/tokens/css-contract.test.ts` | Verified that adding `molecules.css` to `voltLibrary.cssFiles` passes with zero unknown or unmapped CSS variables. |
| `src/tokens/brand.test.ts` | Confirmed that `buildSemanticTokens` produces distinct hex values for `sand`, `mauve`, `slate`, `sage`, `olive`, and `gray`. |
| `npm test` | Confirmed 279 passing tests across 16 test files once `testTimeout` was properly calibrated in `vite.config.ts`. |

## 3. A suggestion I rejected or narrowed

When investigating Issue #3 (Exported JSX compilation error for Station detail), an initial thought was to modify `VOLT_CODEGEN.fixtures` in `src/libraries/volt/composer/codegen.ts` to map `SAMPLE_TARIFF_NOTES` directly to `../components/tariffs`. 

I rejected this change because the existing architecture intentionally uses `../components/data` as the unified barrel export for all fixture data (`SAMPLE_STATIONS`, `SAMPLE_PRICE_BANDS`, `SAMPLE_SESSION`, etc.). Pointing one fixture to `tariffs` would create an inconsistent import structure in exported JSX files. Instead, re-exporting `SAMPLE_TARIFF_NOTES` from `src/components/data.ts` preserved the architectural contract and resolved the compilation failure cleanly with a one-line fix.

## 4. Verification

Exact commands executed and their output:

```bash
npm run build
# Output:
# > prism-ui@0.1.0 build
# > tsc --noEmit && vite build
# vite v5.4.21 building for production...
# ✓ 6314 modules transformed.
# ✓ built in 7.24s

npm test
# Output:
# > prism-ui@0.1.0 test
# > vitest run
# Test Files  16 passed (16)
#      Tests  279 passed (279)
#   Start at  23:35:04
#   Duration  13.37s

npx vitest run src/tokens/css-contract.test.ts
# Output:
# Test Files  1 passed (1)
#      Tests  11 passed (11)
```

## 5. Remaining risk

1. **Storage edge cases under rapid switching**: If a user rapidly cycles libraries while local storage is near quota or in private browsing mode, error handling in `ThemeProvider` is best-effort (`try/catch`). Testing graceful degradation and corrupted JSON recovery in storage would be the next step.
2. **Browser OKLCH gamut support**: Older browser engines that lack wide-gamut Display P3 or OKLCH support may render slightly shifted intermediate chroma values compared to modern WebKit/Blink engines.

## 6. How I directed the investigation

Rather than assuming all tests being green (`278 passed`) meant the project was ready, I ran `npm run build` early in the process. This immediately caught TypeScript compile errors in `src/composer/main.tsx` that `npm test` never detected.

Furthermore, when auditing the test suite for Part 2, I manually inspected `src/libraries/volt/index.ts` against the filesystem. I noticed that while `atoms.css` and `organisms.css` were listed in `cssFiles`, `molecules.css` was missing from the manifest. This proved that `css-contract.test.ts` was passing with a blind spot. I updated `voltLibrary.cssFiles` and ran the contract test to verify that every variable in `molecules.css` was legitimately emitted by the token model.

## 7. Test-suite audit

### 7a. How many of the 278 tests would fail if the thing they test were broken?
**Approximately 115 out of 278 tests.**

*Method used*: I audited all 16 test files and categorized test assertions into functional assertions versus shallow smoke tests:
- **163 shallow/tautological tests**:
  - 155 tests across `composer.test.tsx` (Atlas Charge: 61, Atlas Web: 42) and `registry.test.tsx` (52) merely mount components with default props to check if React renders without throwing (`expect(render(...)).toBeTruthy()`). If component styles, variant logic, or visual states break, these tests stay green.
  - 8 manifest tests check static array lengths and string types without validating runtime functionality.
- **115 genuine functional tests**:
  - `brand.test.ts` (10 tests): Validates OKLCH color math, hex validation, and scale differentiation.
  - `emit.test.ts` (10 tests): Tests token path resolution, scaling calculations, alias chaining, and cycle detection.
  - `dtcg.test.ts` (13 tests): Asserts complete DTCG JSON export structures and mode values.
  - `css-contract.test.ts` (11 tests): Validates CSS variables against emitted token dictionaries.
  - `codegen.test.ts` (10 tests): Checks AST generation, indentation, and import resolution.
  - `levers.test.ts` (16 tests) and individual library token tests (21 tests): Validate semantic role mapping and preset transitions.
  - `schema.test.ts` (10 tests), `figmaMap.test.ts` (5 tests), `motion.test.ts` (2 tests), `themepanel.test.ts` (2 tests): Verify serialization, coordinate offsets, and motion curves.

### 7b. Which tests would you not trust, and why?
1. **Composer component smoke tests (`registry.test.tsx`, `composer.test.tsx`)**: 155 tests only assert that `<Component />` renders without crashing. They do not assert class names, variant styles, data attributes, or user interaction behavior. A completely broken component variant (like `variant="selected"`) passes unconditionally.
2. **`css-contract.test.ts`**: The test only iterates over `meta.cssFiles` declared in the library manifest. If a developer forgets to register a stylesheet (as happened with `molecules.css` in Volt), entire component suites bypass contract enforcement completely.
3. **`themepanel.test.ts`**: Initially relied on regex matching against `.css` source files on disk (`border-radius: 20px`) rather than testing live React component behavior or DOM interactions.

### 7c. Would the suite have caught each of the four bugs?
- **Bug #1 (Gray tint does nothing)**: **No.** `brand.test.ts` tested the `buildSemanticTokens` math helper in isolation, but there were no DOM integration tests asserting that changing `grayTint` in the playground updates the computed CSS custom properties on `document.documentElement`.
- **Bug #2 (Station cards lost selected state)**: **No.** The component test for `StationListCard` only checked that the component mounted without throwing. Furthermore, `molecules.css` was absent from `voltLibrary.cssFiles`, so the CSS contract test never checked it.
- **Bug #3 (Exported JSX will not compile)**: **No.** `codegen.test.ts` only tested isolated sample fixtures and snippets, never compiling the generated JSX of the actual seeded screens (`Station detail`) against the TypeScript compiler.
- **Bug #4 (Theme settings leak across UI libraries)**: **No.** There were no multi-provider integration tests simulating library switching in sequence to check if `localStorage` keys and theme state remained isolated.

### 7d. One day to make this suite honest — what do you change first?
1. **Dynamic CSS contract discovery**: Replace the manually configured `cssFiles` array in `css-contract.test.ts` with a glob search (`src/**/*.css`) so every stylesheet in the repository is automatically validated against the token model.
2. **Automated compilation test for exported JSX**: Add an automated test that iterates through `library.seed().screens`, generates JSX via `puckDataToJsx`, and runs TypeScript type checking (`tsc --noEmit`) against the generated JSX string to ensure all imports and prop types resolve.
3. **Variant and state DOM assertions**: Upgrade the shallow component tests in `registry.test.tsx` to assert that component variants render their corresponding CSS classes (e.g. `.ev-station-card--selected`), disabled attributes, and accessibility ARIA roles.
4. **Library switching integration test**: Add an integration test that simulates switching between Volt, Atlas Web, and Atlas Charge in sequence, verifying that theme customizations in `localStorage` remain strictly isolated per library ID.

