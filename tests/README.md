# Self-Healing Playwright Tests for chrisboyd.dev

This directory contains Playwright tests with AI-assisted self-healing capabilities for the chrisboyd.dev Hugo site.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers (if not already installed):
   ```bash
   npx playwright install
   ```

3. Install the Playwright MCP server globally:
   ```bash
   npm install -g @playwright/mcp
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env` (if not exists)
   - Add your OpenAI API key to `.env`

## Directory Structure

- `tests/` - Test files
  - `ai-helpers/` - AI integration for self-healing tests
  - `pages/` - Page object models
  - `components/` - Component test files
  - `logs/` - Self-healing logs (created when tests run)

## Running Tests

### Basic Tests (Without Self-Healing)

```bash
npx playwright test
```

### With Self-Healing Enabled

Make sure you have added your OpenAI API key to the `.env` file:

```bash
OPENAI_API_KEY=your_api_key_here
```

Then run the tests:

```bash
npx playwright test
```

### Running Specific Tests

```bash
npx playwright test home.spec.ts
```

### Debug Mode

```bash
npx playwright test --debug
```

## How It Works

1. The Playwright MCP server provides accessibility tree data from the browser
2. When a test fails, the self-healing helper captures:
   - The accessibility tree
   - The DOM structure
   - The error message
3. This information is sent to OpenAI with a prompt to fix the issue
4. The AI generates a new approach to solve the problem
5. The new solution is executed and logged

## Extending the Framework

### Adding New Page Objects

Create a new file in `tests/pages/` following the pattern in `home-page.ts`:

```typescript
import { Page } from '@playwright/test';
import { SelfHealingHelper } from '../ai-helpers/self-healing';

export class YourPage {
  private page: Page;
  private selfHealing: SelfHealingHelper | null;
  
  constructor(page: Page, selfHealing: SelfHealingHelper | null = null) {
    this.page = page;
    this.selfHealing = selfHealing;
  }
  
  // Add page-specific methods...
}
```

### Adding New Tests

Create test files in the `tests/` directory following the pattern in `home.spec.ts`. 