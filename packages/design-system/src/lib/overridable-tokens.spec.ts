import 'zone.js';
import 'zone.js/testing';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { FfSelectComponent } from './primitives/ff-select/ff-select.component';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
});

/**
 * Walks a directory tree and returns the absolute paths of every
 * `*.component.scss` file found underneath it.
 */
function collectComponentStylesheets(rootDir: string): string[] {
  const result: string[] = [];
  for (const entry of readdirSync(rootDir)) {
    const fullPath = join(rootDir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      result.push(...collectComponentStylesheets(fullPath));
    } else if (entry.endsWith('.component.scss')) {
      result.push(fullPath);
    }
  }
  return result;
}

/**
 * Splits a SCSS source string into the list of "own" declaration bodies of
 * every brace-delimited rule, i.e. the text that sits directly inside each
 * `{ ... }` excluding the text that belongs to further-nested rules. SCSS
 * interpolations (`#{...}`) are blanked out first so their braces never
 * confuse the same brace-depth bookkeeping used for real rule blocks.
 */
function ownRuleBodies(scss: string): string[] {
  const withoutInterpolation = scss.replace(/#\{[^}]*\}/g, '__I__');
  const bodies: string[] = [];
  const stack: string[] = [''];

  for (const char of withoutInterpolation) {
    if (char === '{') {
      stack.push('');
    } else if (char === '}') {
      const own = stack.pop();
      if (own !== undefined) {
        bodies.push(own);
      }
    } else {
      stack[stack.length - 1] += char;
    }
  }

  return bodies;
}

/** Strips `//` line comments so prose mentioning a token name cannot be mistaken for code. */
function withoutLineComments(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\/\/.*$/, ''))
    .join('\n');
}

/**
 * Custom properties declared as a statement (`--ff-foo: ...;`) directly inside
 * a rule body. Consumption (`var(--ff-foo, ...)`) is never followed by a
 * colon — only `,`/`)` — so matching `--ff-foo:` unambiguously finds
 * declarations regardless of what precedes them (start of block, a `;`, or a
 * comment line).
 */
function declaredTokens(ruleBody: string): Set<string> {
  const matches = withoutLineComments(ruleBody).matchAll(/(--ff-[\w-]+)\s*:/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

/** Custom properties read via `var(--ff-foo, ...)` directly inside a rule body. */
function consumedTokens(ruleBody: string): Set<string> {
  const matches = withoutLineComments(ruleBody).matchAll(/var\(\s*(--ff-[\w-]+)/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

const libDir = join(dirname(fileURLToPath(import.meta.url)));
const stylesheets = collectComponentStylesheets(libDir);

describe('design-system component tokens are overridable by an ancestor', () => {
  it('finds component stylesheets to check (sanity guard against a broken glob)', () => {
    expect(stylesheets.length).toBeGreaterThan(20);
  });

  it.each(stylesheets)(
    'never declares and consumes the same --ff-* token in the same rule (%s)',
    (path) => {
      // A custom property specified on an element always wins over one
      // inherited from an ancestor. The moment a rule both declares
      // `--ff-x` and reads `var(--ff-x)`, that rule's own declaration is
      // guaranteed to be the specified value for `--ff-x` on every element
      // it matches, so an ancestor supplying `--ff-x` can never take
      // effect. Declaring a token in one rule (e.g. a `--variant` modifier
      // picking its final color) and consuming it in a *different* rule is
      // fine — this only forbids the self-shadowing pattern.
      const scss = readFileSync(path, 'utf8');
      const offendingRules = ownRuleBodies(scss)
        .map((body) => {
          const declared = declaredTokens(body);
          const consumed = consumedTokens(body);
          const overlap = Array.from(declared).filter((token) => consumed.has(token));
          return { body, overlap };
        })
        .filter(({ overlap }) => overlap.length > 0);

      expect(offendingRules).toEqual([]);
    },
  );
});

/**
 * Behavioural half of the contract above. `getComputedStyle` in the jsdom
 * environment used by this Vitest suite does not implement CSS Custom
 * Properties at all: it neither inherits `--foo` declarations down to
 * descendants nor substitutes `var(--foo, fallback)` in longhand
 * properties (verified against this exact scenario before writing this
 * spec — the computed value comes back as the literal, unresolved
 * `"var(--foo, fallback)"` string, and an inherited custom property reads
 * back as `""` on the child). Asserting on `getComputedStyle` here would
 * therefore pass or fail for reasons unrelated to the actual cascade, i.e.
 * it would not test anything. A real assertion on the final resolved value
 * needs a real browser engine (a Playwright/Storybook interaction test),
 * which is a larger addition than this fix and is left as a follow-up.
 *
 * What *is* reliable in jsdom, and is exercised here, is the DOM wiring:
 * that the ancestor really is an ancestor of the component's native
 * element, and that the ancestor really carries the overriding
 * declaration. Combined with the static proof above (the component only
 * ever reads this token through `var(--ff-select-min-width, ...)` and
 * never re-declares it), the CSS cascade — which is a browser guarantee,
 * not application behaviour — is what makes the override effective.
 */
describe('an ancestor can widen/narrow a component through its token', () => {
  @Component({
    standalone: true,
    imports: [FfSelectComponent],
    template: `
      <div class="narrow-container" style="--ff-select-min-width: 64px">
        <ff-select [options]="[]" />
      </div>
    `,
  })
  class NarrowingHostComponent {}

  let fixture: ComponentFixture<NarrowingHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NarrowingHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NarrowingHostComponent);
    fixture.detectChanges();
  });

  it('renders the select as a descendant of the ancestor that declares the override', () => {
    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector('.narrow-container') as HTMLElement;
    const select = host.querySelector('ff-select') as HTMLElement;

    expect(container).toBeTruthy();
    expect(select).toBeTruthy();
    expect(container.contains(select)).toBe(true);
  });

  it('exposes the overriding token on the ancestor, ready to be inherited', () => {
    const host = fixture.nativeElement as HTMLElement;
    const container = host.querySelector('.narrow-container') as HTMLElement;

    expect(container.style.getPropertyValue('--ff-select-min-width').trim()).toBe('64px');
  });

  it('confirms the select never re-declares --ff-select-min-width, so the ancestor value is free to cascade', () => {
    const scssPath = join(libDir, 'primitives', 'ff-select', 'ff-select.component.scss');
    const scss = readFileSync(scssPath, 'utf8');

    expect(scss).toMatch(/min-width:\s*var\(--ff-select-min-width,\s*180px\)/);
    expect(scss).not.toMatch(/^\s*--ff-select-min-width\s*:/m);
  });
});
