import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';
import { SelfHealingHelper } from './ai-helpers/self-healing';
import { MCPServer } from './ai-helpers/mcp-server';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up the MCP server
const mcpServer = new MCPServer(8033, false, true);

// Get API key for OpenAI (should be in .env file)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Create a self-healing helper if API key is available
const selfHealingHelper = OPENAI_API_KEY 
  ? new SelfHealingHelper(OPENAI_API_KEY, 3, true)
  : null;

// Set up the test suite
test.describe('Home Page Tests', () => {
  // Start the MCP server before all tests
  test.beforeAll(async () => {
    if (selfHealingHelper) {
      console.log('Starting MCP server for AI-assisted testing...');
      await mcpServer.start();
    } else {
      console.log('OPENAI_API_KEY not found, running without self-healing capabilities');
    }
  });
  
  // Stop the MCP server after all tests
  test.afterAll(async () => {
    if (selfHealingHelper) {
      await mcpServer.stop();
    }
  });
  
  // Test: Check page title
  test('has the correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    const title = await homePage.getTitle();
    expect(title).toContain("Chris Boyd's Blog");
  });
  
  // Test: Check welcome message
  test('displays welcome message', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    
    const hasWelcome = await homePage.hasWelcomeMessage();
    expect(hasWelcome).toBeTruthy();
  });
  
  // Test: Check navigation links
  test('has navigation links', async ({ page }) => {
    const homePage = new HomePage(page, selfHealingHelper);
    await homePage.navigate();
    
    const links = await homePage.getNavigationLinks();
    expect(links).toContain('About');
    expect(links).toContain('Portfolio');
    expect(links).toContain('Contact');
  });
  
  // Test: Navigate to About page
  test('can navigate to About page', async ({ page }) => {
    const homePage = new HomePage(page, selfHealingHelper);
    await homePage.navigate();
    
    await homePage.clickNavigationLink('About');
    
    // Check that we're now on the About page
    expect(page.url()).toContain('/about');
  });
}); 