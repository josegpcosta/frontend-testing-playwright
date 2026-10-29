import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected abstract readonly path: string;

  /** Element that proves the SPA finished rendering the page. */
  protected abstract readonly readyIndicator: Locator;

  static readonly READY_TIMEOUT = 15_000;

  constructor(readonly page: Page) {}

  /**
   * Navigates and waits until the page is actually rendered.
   * The load event fires before the React app mounts, so waiting for it alone
   * leads to scattered "element(s) not found" timeouts and axe scans on an empty page.
   */
  async goto(): Promise<void> {
    await this.page.goto(this.path);
    try {
      await this.readyIndicator.waitFor({ state: 'visible', timeout: BasePage.READY_TIMEOUT });
    } catch {
      throw new Error(
        `${this.path} did not render within ${BasePage.READY_TIMEOUT}ms. ` +
          `url="${this.page.url()}" title="${await this.page.title()}"`
      );
    }
  }

  /**
   * Text of the label(s) programmatically associated with a form field,
   * via <label for>, a wrapping <label>, or aria-labelledby.
   * Returns an empty string when the field has no associated label.
   */
  async labelTextOf(field: Locator): Promise<string> {
    return field.evaluate((el) => {
      const input = el as HTMLInputElement;
      const fromLabels = Array.from(input.labels ?? []).map((label) => label.textContent ?? '');
      const fromAriaLabelledBy = (input.getAttribute('aria-labelledby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent ?? '');
      return [...fromLabels, ...fromAriaLabelledBy].join(' ').trim();
    });
  }

  /** Text of the elements referenced by aria-describedby (hints and validation errors). */
  async describedByText(field: Locator): Promise<string> {
    return field.evaluate((el) =>
      (el.getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' | ')
    );
  }

  /**
   * Native HTML5 constraint validation message (the browser tooltip).
   * This text is not part of the DOM, so it cannot be found with getByText.
   */
  async validationMessageOf(field: Locator): Promise<string> {
    return field.evaluate((el) => (el as HTMLInputElement).validationMessage);
  }

  async isValid(field: Locator): Promise<boolean> {
    return field.evaluate((el) => (el as HTMLInputElement).validity.valid);
  }

  /** Returns the locators sorted by their position in the DOM (the default tab order). */
  async sortByDomOrder(locators: Locator[]): Promise<Locator[]> {
    const positions = await Promise.all(
      locators.map((l) => l.evaluate((el) => Array.from(document.querySelectorAll('*')).indexOf(el)))
    );
    return locators
      .map((locator, i) => ({ locator, position: positions[i] }))
      .sort((a, b) => a.position - b.position)
      .map(({ locator }) => locator);
  }

  /**
   * Presses Tab until the target element receives focus.
   * Returns false if it is not reached within maxTabs presses.
   */
  async tabUntilFocused(target: Locator, maxTabs = 10): Promise<boolean> {
    for (let i = 0; i < maxTabs; i++) {
      if (await target.evaluate((el) => el === document.activeElement)) return true;
      await this.page.keyboard.press('Tab');
    }
    return target.evaluate((el) => el === document.activeElement);
  }
}
