import { Page } from '@playwright/test';
import { SelfHealingHelper } from '../ai-helpers/self-healing';

/**
 * Page object for the home page
 */
export class HomePage {
  private page: Page;
  private selfHealing: SelfHealingHelper | null;
  
  /**
   * Create a new home page object
   * @param page Playwright page object
   * @param selfHealing Self-healing helper (optional)
   */
  constructor(page: Page, selfHealing: SelfHealingHelper | null = null) {
    this.page = page;
    this.selfHealing = selfHealing;
  }
  
  /**
   * Navigate to the home page
   * @returns Promise that resolves when navigation is complete
   */
  async navigate(): Promise<void> {
    if (this.selfHealing) {
      return this.selfHealing.executeWithHealing(
        this.page,
        'Navigate to home page',
        async () => {
          await this.page.goto('/');
          await this.page.waitForLoadState('networkidle');
        }
      );
    } else {
      await this.page.goto('/');
      await this.page.waitForLoadState('networkidle');
    }
  }
  
  /**
   * Get the title of the page
   * @returns Title of the page
   */
  async getTitle(): Promise<string> {
    if (this.selfHealing) {
      return this.selfHealing.executeWithHealing(
        this.page,
        'Get page title',
        async () => {
          return await this.page.title();
        }
      );
    } else {
      return await this.page.title();
    }
  }
  
  /**
   * Check if the welcome message is visible
   * @returns True if the welcome message is visible
   */
  async hasWelcomeMessage(): Promise<boolean> {
    if (this.selfHealing) {
      return this.selfHealing.executeWithHealing(
        this.page,
        'Check welcome message',
        async () => {
          // This is designed to be a selector that might break, to demonstrate self-healing
          const welcomeText = await this.page.textContent('text="Welcome to My Site"');
          return welcomeText !== null && welcomeText.includes('Welcome');
        }
      );
    } else {
      const welcomeText = await this.page.textContent('text="Welcome to My Site"');
      return welcomeText !== null && welcomeText.includes('Welcome');
    }
  }
  
  /**
   * Get all navigation links
   * @returns Array of navigation link texts
   */
  async getNavigationLinks(): Promise<string[]> {
    if (this.selfHealing) {
      return this.selfHealing.executeWithHealing(
        this.page,
        'Get navigation links',
        async () => {
          const links = await this.page.$$('nav a');
          return Promise.all(links.map(link => link.textContent().then(text => text || '')));
        }
      );
    } else {
      const links = await this.page.$$('nav a');
      return Promise.all(links.map(link => link.textContent().then(text => text || '')));
    }
  }
  
  /**
   * Click on a navigation link by its text
   * @param linkText Text of the link to click
   */
  async clickNavigationLink(linkText: string): Promise<void> {
    if (this.selfHealing) {
      return this.selfHealing.executeWithHealing(
        this.page,
        `Click navigation link "${linkText}"`,
        async () => {
          await this.page.click(`nav a:text-is("${linkText}")`);
          await this.page.waitForLoadState('networkidle');
        },
        `Looking for a navigation link with text "${linkText}"`
      );
    } else {
      await this.page.click(`nav a:text-is("${linkText}")`);
      await this.page.waitForLoadState('networkidle');
    }
  }
} 