import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Class to manage the Playwright MCP server
 */
export class MCPServer {
  private serverProcess: ChildProcess | null = null;
  private port: number;
  private headless: boolean;
  private debug: boolean;
  
  /**
   * Create a new MCP server manager
   * @param port Port to run the server on (default: 8033)
   * @param headless Whether to run in headless mode (default: false)
   * @param debug Whether to log debug information (default: false)
   */
  constructor(port = 8033, headless = false, debug = false) {
    this.port = port;
    this.headless = headless;
    this.debug = debug;
  }
  
  /**
   * Log a message if debug is enabled
   * @param message Message to log
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[MCPServer] ${message}`);
    }
  }
  
  /**
   * Start the MCP server
   * @returns Promise that resolves when the server is ready
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Make sure the config file exists
        this.ensureConfigExists();
        
        // Build the command arguments
        const args = ['@playwright/mcp'];
        
        if (this.headless) {
          args.push('--headless');
        }
        
        args.push('--port', this.port.toString());
        
        // Start the server process
        this.log(`Starting MCP server on port ${this.port}`);
        this.serverProcess = spawn('npx', args, {
          stdio: this.debug ? 'inherit' : 'ignore',
          detached: false
        });
        
        // Set up event handlers
        this.serverProcess.on('error', (error) => {
          this.log(`Server failed to start: ${error.message}`);
          reject(error);
        });
        
        this.serverProcess.on('exit', (code) => {
          if (code !== 0 && code !== null) {
            this.log(`Server exited with code ${code}`);
            reject(new Error(`Server exited with code ${code}`));
          }
        });
        
        // Wait for the server to start
        setTimeout(() => {
          this.log('Server started');
          resolve();
        }, 2000); // Give it 2 seconds to start
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Ensure the MCP config file exists
   */
  private ensureConfigExists(): void {
    const configPath = path.join(process.cwd(), 'mcp.config.json');
    
    if (!fs.existsSync(configPath)) {
      this.log('Creating default MCP config file');
      const configContent = {
        mcpServers: {
          playwright: {
            command: 'npx',
            args: ['@playwright/mcp@latest']
          }
        }
      };
      
      fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
    }
  }
  
  /**
   * Stop the MCP server
   */
  async stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.serverProcess) {
        this.log('Stopping MCP server');
        // Kill the process
        if (process.platform === 'win32') {
          // Windows requires a different approach
          spawn('taskkill', ['/pid', this.serverProcess.pid!.toString(), '/f', '/t']);
        } else {
          // Unix-like systems can use process.kill
          process.kill(-this.serverProcess.pid!, 'SIGTERM');
        }
        
        this.serverProcess = null;
      }
      
      resolve();
    });
  }
  
  /**
   * Get the URL of the MCP server
   * @returns URL of the server
   */
  getServerUrl(): string {
    return `http://localhost:${this.port}`;
  }
} 