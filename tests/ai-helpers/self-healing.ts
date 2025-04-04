import { OpenAI } from 'openai';
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Self-healing test helper that uses OpenAI and Playwright MCP to fix failing tests
 */
export class SelfHealingHelper {
  private openai: OpenAI;
  private maxAttempts: number;
  private debug: boolean;
  
  /**
   * Create a new SelfHealingHelper
   * @param apiKey OpenAI API key
   * @param maxAttempts Maximum number of attempts to fix a failing test (default: 3)
   * @param debug Whether to log debug information (default: false)
   */
  constructor(apiKey: string, maxAttempts = 3, debug = false) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.maxAttempts = maxAttempts;
    this.debug = debug;
  }
  
  /**
   * Log a message if debug is enabled
   * @param message Message to log
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[SelfHealing] ${message}`);
    }
  }
  
  /**
   * Get the accessibility tree from the page using Playwright MCP
   * @param page Playwright page object
   * @returns Accessibility tree as JSON
   */
  private async getAccessibilityTree(page: Page): Promise<string> {
    // This uses the Playwright MCP server's accessibility tree
    const snapshot = await page.accessibility.snapshot();
    return JSON.stringify(snapshot, null, 2);
  }
  
  /**
   * Get the current DOM of the page
   * @param page Playwright page object
   * @returns HTML string of the page
   */
  private async getPageDOM(page: Page): Promise<string> {
    return await page.content();
  }
  
  /**
   * Execute a function with self-healing capability
   * @param page Playwright page object
   * @param actionName Name of the action being performed
   * @param action Function to execute that might fail
   * @param context Additional context for the AI
   * @returns Result of the action
   */
  async executeWithHealing<T>(
    page: Page,
    actionName: string,
    action: () => Promise<T>,
    context: string = ''
  ): Promise<T> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < this.maxAttempts) {
      try {
        this.log(`Attempt ${attempts + 1}/${this.maxAttempts} for action: ${actionName}`);
        return await action();
      } catch (error) {
        lastError = error as Error;
        this.log(`Error in attempt ${attempts + 1}: ${lastError.message}`);
        
        if (attempts < this.maxAttempts - 1) {
          this.log('Attempting to heal...');
          
          // Get current page state
          const accessibilityTree = await this.getAccessibilityTree(page);
          const pageDOM = await this.getPageDOM(page);
          
          // Ask AI for a solution
          const solution = await this.getAISolution(
            actionName,
            lastError.message,
            accessibilityTree,
            pageDOM,
            context
          );
          
          if (solution) {
            this.log(`AI suggested solution: ${solution}`);
            // Generate and evaluate the new action
            action = await this.generateNewAction(solution, page, actionName);
          }
        }
        
        attempts++;
      }
    }
    
    // If we get here, all attempts failed
    throw new Error(`Action "${actionName}" failed after ${this.maxAttempts} attempts: ${lastError?.message}`);
  }
  
  /**
   * Get a solution from the AI
   * @param actionName Name of the action being performed
   * @param errorMessage Error message from the failed action
   * @param accessibilityTree Accessibility tree of the page
   * @param pageDOM DOM of the page
   * @param context Additional context
   * @returns AI solution
   */
  private async getAISolution(
    actionName: string,
    errorMessage: string,
    accessibilityTree: string,
    pageDOM: string,
    context: string
  ): Promise<string | null> {
    try {
      const prompt = `
You are an expert in Playwright test automation and web development.

I'm trying to perform this action in a Playwright test: "${actionName}"
But I'm getting this error: "${errorMessage}"

I'm testing a Hugo static site and need to fix this test.

Here's the current page accessibility tree (from Playwright MCP):
${accessibilityTree.length > 5000 ? accessibilityTree.substring(0, 5000) + '... (truncated)' : accessibilityTree}

Here's the current page DOM:
${pageDOM.length > 5000 ? pageDOM.substring(0, 5000) + '... (truncated)' : pageDOM}

Additional context:
${context}

Please suggest a new Playwright action to replace the failing one. 
Provide your answer as executable TypeScript code for Playwright only, without explanations or markdown.
`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: 'You are an expert Playwright test automation assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });
      
      return response.choices[0]?.message?.content || null;
    } catch (error) {
      this.log(`Error getting AI solution: ${(error as Error).message}`);
      return null;
    }
  }
  
  /**
   * Generate a new action function based on AI's solution
   * @param solution AI's solution
   * @param page Playwright page
   * @param actionName Name of the action
   * @returns New action function
   */
  private async generateNewAction<T>(
    solution: string,
    page: Page,
    actionName: string
  ): Promise<() => Promise<T>> {
    // Log the solution to a file for debugging
    if (this.debug) {
      const logsDir = path.join(process.cwd(), 'tests', 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(logsDir, `healing-${actionName}-${timestamp}.ts`);
      fs.writeFileSync(logFile, solution);
    }
    
    // Create a new function that will execute the AI's solution
    // This is obviously risky in production, but for testing purposes it's a powerful approach
    try {
      // Strip any markdown code blocks if present
      let cleanSolution = solution;
      if (solution.includes('```')) {
        cleanSolution = solution
          .split('```')
          .filter((_, index) => index % 2 === 1)
          .join('\n');
      }
      
      // Create a Function that returns a Promise
      // eslint-disable-next-line no-new-func
      const newAction = new Function('page', `
        return (async () => {
          try {
            ${cleanSolution}
          } catch (error) {
            throw new Error(\`AI-generated solution failed: \${error.message}\`);
          }
        })();
      `) as (page: Page) => Promise<T>;
      
      // Return a function that will execute this code with the page
      return () => newAction(page);
    } catch (error) {
      this.log(`Error creating new action: ${(error as Error).message}`);
      // Return a function that will fail with the original error
      return () => Promise.reject(error);
    }
  }
} 