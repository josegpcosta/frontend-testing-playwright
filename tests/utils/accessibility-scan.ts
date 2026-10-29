import { AxeBuilder } from '@axe-core/playwright';
import { Page, expect } from '@playwright/test';

/** WCAG 2.0 / 2.1, levels A and AA. Axe best-practice rules are excluded. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function runAccessibilityScan(page: Page, tags: string[] = WCAG_TAGS): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();

  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.help} [${v.nodes.length} node(s)]`);

  expect(summary, 'No accessibility violations').toEqual([]);
}
