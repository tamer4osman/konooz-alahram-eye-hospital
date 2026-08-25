import type { Page } from '@playwright/test';

const KNOWN_NOISE: RegExp[] = [
  /Failed to load resource.*401/,
];

export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (KNOWN_NOISE.some((pattern) => pattern.test(msg.text()))) return;
    errors.push(msg.text());
  });
  return errors;
}
