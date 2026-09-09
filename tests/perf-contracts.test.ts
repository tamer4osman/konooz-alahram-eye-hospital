/**
 * Performance contracts — regression guards for the 2026-09-09 perf audit fixes.
 *
 * These read production source and assert the structural decisions that keep
 * Core Web Vitals healthy. The project's test suite runs in a node env without
 * React rendering, so rendering-level guarantees are pinned at the source level.
 *
 *  1. LCP contract: the Hero (largest contentful paint) must be server-rendered.
 *     `next/image`'s `priority` preload link is only emitted for server-rendered
 *     images; a `ssr: false` dynamic import defeats it and delays LCP until after
 *     hydration.
 *  2. Streaming contract: the homepage's async data slots (technologies,
 *     testimonials, faqs) must each sit inside a <Suspense> boundary so the shell
 *     can stream before the slowest DB query resolves.
 *  3. Preload contract: the hero Image keeps `priority` + `sizes` so the
 *     browser starts fetching it from the initial HTML.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

function readSource(relativePath: string): string {
  return readFileSync(path.join(rootDir, relativePath), 'utf8');
}

/** Extract every `<Suspense ...> ... </Suspense>` block body (no nesting in scope). */
function suspenseBodies(source: string): string[] {
  const block = /<Suspense[\s\S]*?>([\s\S]*?)<\/Suspense>/g;
  const bodies: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = block.exec(source)) !== null) {
    bodies.push(match[1]);
  }
  return bodies;
}

/** Extract the full `dynamic(() => import('...X'), {...});` call for a component name. */
function dynamicImportCall(source: string, componentName: string): string {
  const marker = `import('@/components/${componentName}')`;
  const start = source.indexOf(marker);
  if (start === -1) return '';
  const optionsStart = source.indexOf('{', start);
  const end = source.indexOf(');', optionsStart);
  if (optionsStart === -1 || end === -1) return '';
  return source.slice(start, end + 2);
}

describe('perf contract: LCP element is server-rendered', () => {
  it('does not lazy-load the Hero behind ssr:false', () => {
    const source = readSource('components/HomePageClient.tsx');
    const heroCall = dynamicImportCall(source, 'Hero');
    expect(heroCall).not.toBe('');
    expect(heroCall).not.toContain('ssr: false');
  });
});

describe('perf contract: homepage slots stream inside Suspense', () => {
  it.each([
    ['technologiesSlot', 'TechnologiesSection'],
    ['testimonialsSlot', 'TestimonialsSection'],
    ['faqsSlot', 'FaqsSection'],
  ] as const)(
    'renders %s inside a Suspense boundary',
    (slot, sectionComponent) => {
      const source = readSource('app/[locale]/page.tsx');
      // The slot prop must exist and its Suspense body must render the section.
      expect(source).toContain(`${slot}={`);
      const bodies = suspenseBodies(source);
      expect(
        bodies.some((body) => body.includes(`<${sectionComponent} />`)),
        `expected <${sectionComponent} /> inside a <Suspense> block (slot "${slot}"); found ${bodies.length} block(s)`,
      ).toBe(true);
    },
  );
});

describe('perf contract: hero image preload attributes survive refactors', () => {
  it('keeps priority + sizes on the LCP hero image', () => {
    const source = readSource('components/Hero.tsx');
    const imageStart = source.indexOf('<Image');
    expect(imageStart).not.toBe(-1);
    const imageBlock = source.slice(imageStart, imageStart + 400);
    expect(imageBlock).toContain('HOSPITAL_IMAGES.heroSurgery');
    expect(imageBlock).toContain('priority');
    expect(imageBlock).toContain('sizes=');
  });
});
