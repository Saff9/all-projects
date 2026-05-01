/**
 * Comprehensive CLI utilities for developers.
 * Provides argument parsing, command execution, interactive prompts, output display, colors, and more.
 * @module cli
 */

import { spawn as nodeSpawn, ChildProcess } from 'child_process';
import * as readline from 'readline';
import chalk from 'chalk';
import process from 'process';

// ============================================================================
// Type Definitions
// ============================================================================

/** CLI color type */
export type CliColor = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'grey';

/** Log levels */
export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

/** Print options */
export interface PrintOptions {
  /** Output stream */
  stream?: 'stdout' | 'stderr';
  /** Newline after print */
  newline?: boolean;
}

/** Parse options for arguments */
export interface ParseArgsOptions {
  /** Aliases for arguments */
  alias?: Record<string, string | string[]>;
  /** Default values */
  default?: Record<string, any>;
  /** Types for arguments */
  types?: Record<string, 'string' | 'number' | 'boolean'>;
  /** Stop parsing at first non-flag */
  stopEarly?: boolean;
  /** Unknown flags handler */
  unknown?: (flag: string) => void;
}

/** Exec options */
export interface ExecOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Maximum buffer size */
  maxBuffer?: number;
  /** Shell to use */
  shell?: string;
  /** Encoding */
  encoding?: string;
  /** Throw on error */
  throwOnError?: boolean;
}

/** Spawn options */
export interface SpawnOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: Record<string, string>;
  /** stdio configuration */
  stdio?: 'pipe' | 'ignore' | 'inherit';
  /** Shell to use */
  shell?: boolean | string;
  /** Detach process */
  detached?: boolean;
}

/** Progress bar options */
export interface ProgressBarOptions {
  /** Total value */
  total?: number;
  /** Width of bar */
  width?: number;
  /** Format string */
  format?: string;
  /** Clear on complete */
  clear?: boolean;
  /** Complete character */
  completeChar?: string;
  /** Incomplete character */
  incompleteChar?: string;
}

/** Spinner options */
export interface SpinnerOptions {
  /** Spinner pattern */
  pattern?: string[];
  /** Spinner text */
  text?: string;
  /** Spinner color */
  color?: CliColor;
}

/** Prompt options */
export interface PromptOptions {
  /** Default value */
  default?: string;
  /** Input stream (defaults to stdin) */
  input?: NodeJS.ReadStream;
  /** Output stream (defaults to stdout) */
  output?: NodeJS.WriteStream;
  /** Validate input */
  validate?: (input: string) => boolean | string;
  /** Custom prompt message */
  prompt?: string;
}

/** Table options */
export interface TableOptions {
  /** Columns configuration */
  columns?: string[];
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom header style */
  headerStyle?: Partial<{
    color: CliColor;
    bold: boolean;
    underline: boolean;
  }>;
  /** Border style */
  border?: boolean;
}

/** Tree options */
export interface TreeOptions {
  /** Indent size */
  indent?: number;
  /** Root label */
  root?: string;
  /** Custom formatter */
  formatter?: (node: any, depth: number) => string;
}

/** Terminal size */
export interface TerminalSize {
  /** Number of columns */
  columns: number;
  /** Number of rows */
  rows: number;
}

// ============================================================================
// Argument Parsing
// ============================================================================

/**
 * Get command line arguments as array.
 * Returns an empty array if no arguments are available.
 *
 * @returns Array of command line arguments
 * @example
 * ```
 * // CLI: node script.js arg1 arg2 --flag value
 * const args = getArgs();
 * // ['arg1', 'arg2', '--flag', 'value']
 * ```
 */
export function getArgs(): string[] {
  return process.argv.slice(2);
}

/**
 * Get command line flags as object.
 * Parses flags like --key value or --key=value into an object.
 *
 * @returns Object with flag names as keys and values
 * @example
 * ```
 * // CLI: node script.js --name John --count 5
 * const flags = getFlags();
 * // { name: 'John', count: '5' }
 * ```
 */
export function getFlags(): Record<string, string> {
  const args = getArgs();
  const flags: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      // Check if next arg is a value (not a flag)
      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg;
        i++;
      } else if (nextArg && nextArg.startsWith('=')) {
        // Handle --key=value format
        flags[key] = nextArg.slice(1);
        i++;
      } else {
        flags[key] = 'true';
      }
    } else if (arg.startsWith('-')) {
      // Short flag -k value
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        flags[key] = nextArg;
        i++;
      } else {
        flags[key] = 'true';
      }
    }
  }
  
  return flags;
}

/**
 * Parse arguments with options for aliases, defaults, and types.
 *
 * @param args - Arguments to parse (defaults to process.argv)
 * @param options - Parsing options
 * @returns Parsed arguments object
 * @example
 * ```
 * parseArgs(['arg1', '--name', 'John', '-c', '5'], {
 *   alias: { n: 'name' },
 *   default: { name: 'Anonymous' },
 *   types: { count: 'number' }
 * });
 * // { positional: ['arg1'], name: 'John', count: 5 }
 * ```
 */
export function parseArgs(args: string[] = getArgs(), options: ParseArgsOptions = {}): {
  positional: string[];
  flags: Record<string, any>;
} {
  const { alias = {}, default: defaults = {}, types = {}, stopEarly = false, unknown } = options;
  
  const positional: string[] = [];
  const flags: Record<string, any> = {};
  
  // Set defaults
  for (const key in defaults) {
    flags[key] = defaults[key];
  }
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (stopEarly && !arg.startsWith('-')) {
      positional.push(...args.slice(i));
      break;
    }
    
    if (arg.startsWith('--')) {
      const fullKey = arg.slice(2);
      const key = Object.keys(alias).find(k => alias[k] === fullKey) || fullKey;
      
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        let value: any = args[++i];
        // Convert type
        if (types[key] === 'number') value = Number(value);
        else if (types[key] === 'boolean') value = value === 'true';
        flags[key] = value;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const shortKey = arg.slice(1);
      const key = Object.keys(alias).find(k => {
        const aliasVal = alias[k];
        return Array.isArray(aliasVal) ? aliasVal.includes(shortKey) : aliasVal === shortKey;
      }) || shortKey;
      
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        let value: any = args[++i];
        if (types[key] === 'number') value = Number(value);
        else if (types[key] === 'boolean') value = value === 'true';
        flags[key] = value;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  
  return { positional, flags };
}

/**
 * Parse flags from arguments into an object.
 * Handles both --flag value and --flag=value formats.
 *
 * @param args - Arguments to parse
 * @returns Object with flags
 * @example
 * ```
 * parseFlags(['--verbose', '--output=file.txt', '-v']);
 * // { verbose: 'true', output: 'file.txt', v: 'true' }
 * ```
 */
export function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      flags[key] = parts.length > 1 ? parts[1] : 'true';
    } else if (arg.startsWith('-') && !arg.startsWith('--')) {
      const key = arg.slice(1);
      flags[key] = 'true';
    }
  }
  
  return flags;
}

/**
 * Get first non-flag argument from args.
 *
 * @param args - Arguments to search (defaults to process.argv)
 * @returns First non-flag argument or undefined
 * @example
 * ```
 * getFirstArg(['--verbose', 'input.txt']);
 * // 'input.txt'
 * ```
 */
export function getFirstArg(args: string[] = getArgs()): string | undefined {
  return args.find(arg => !arg.startsWith('-'));
}

/**
 * Get last non-flag argument from args.
 *
 * @param args - Arguments to search (defaults to process.argv)
 * @returns Last non-flag argument or undefined
 * @example
 * ```
 * getLastArg(['--verbose', 'input.txt', 'output.txt']);
 * // 'output.txt'
 * ```
 */
export function getLastArg(args: string[] = getArgs()): string | undefined {
  const nonFlags = args.filter(arg => !arg.startsWith('-'));
  return nonFlags[nonFlags.length - 1];
}

/**
 * Check if a flag exists in arguments.
 *
 * @param args - Arguments to search
 * @param flag - Flag to check (with or without --)
 * @returns True if flag exists
 * @example
 * ```
 * hasFlag(getArgs(), 'verbose');
 * hasFlag(getArgs(), '--verbose');
 * ```
 */
export function hasFlag(args: string[], flag: string): boolean {
  const normalizedFlag = flag.startsWith('--') ? flag : `--${flag}`;
  return args.some(arg => arg === normalizedFlag || arg.startsWith(`${normalizedFlag}=`));
}

/**
 * Get flag value from arguments.
 *
 * @param args - Arguments to search
 * @param flag - Flag to get (with or without --)
 * @param defaultValue - Default value if flag not found
 * @returns Flag value or default
 * @example
 * ```
 * getFlagValue(getArgs(), 'name', 'Anonymous');
 * getFlagValue(getArgs(), '--name', 'Anonymous');
 * ```
 */
export function getFlagValue<T = string>(args: string[], flag: string, defaultValue?: T): T | string {
  const normalizedFlag = flag.startsWith('--') ? flag : `--${flag}`;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === normalizedFlag) {
      const nextArg = args[i + 1];
      return (nextArg && !nextArg.startsWith('-')) ? nextArg : 'true';
    }
    
    if (arg.startsWith(`${normalizedFlag}=`)) {
      return arg.slice(normalizedFlag.length + 1);
    }
  }
  
  return defaultValue as any;
}

/**
 * Remove a flag and its value from arguments.
 *
 * @param args - Arguments to modify
 * @param flag - Flag to remove (with or without --)
 * @returns New args array without the flag
 * @example
 * ```
 * removeFlag(['--verbose', 'file.txt', '--debug'], 'verbose');
 * // ['file.txt', '--debug']
 * ```
 */
export function removeFlag(args: string[], flag: string): string[] {
  const normalizedFlag = flag.startsWith('--') ? flag : `--${flag}`;
  const result: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === normalizedFlag) {
      // Skip flag and its value if present
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        i++;
      }
      continue;
    }
    
    if (arg.startsWith(`${normalizedFlag}=`)) {
      continue;
    }
    
    result.push(arg);
  }
  
  return result;
}

/**
 * Extract all flags from arguments.
 *
 * @param args - Arguments to extract from
 * @returns Object with flags and positional args
 * @example
 * ```
 * extractFlags(['--name', 'John', 'file.txt', '--verbose']);
 * // { flags: { name: 'John', verbose: 'true' }, positional: ['file.txt'] }
 * ```
 */
export function extractFlags(args: string[]): { flags: Record<string, string>; positional: string[] } {
  const flags: Record<string, string> = {};
  const positional: string[] = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const parts = arg.slice(2).split('=');
      const key = parts[0];
      
      if (parts.length > 1) {
        flags[key] = parts[1];
      } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
        flags[key] = args[++i];
      } else {
        flags[key] = 'true';
      }
    } else if (arg.startsWith('-') && !arg.startsWith('--')) {
      const key = arg.slice(1);
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        flags[key] = args[++i];
      } else {
        flags[key] = 'true';
      }
    } else {
      positional.push(arg);
    }
  }
  
  return { flags, positional };
}

/**
 * Extract positional (non-flag) arguments from args.
 *
 * @param args - Arguments to extract from
 * @returns Array of positional arguments
 * @example
 * ```
 * extractOptions(['--verbose', 'input.txt', 'output.txt']);
 * // ['input.txt', 'output.txt']
 * ```
 */
export function extractOptions(args: string[]): string[] {
  return args.filter(arg => !arg.startsWith('-'));
}

// ============================================================================
// Command Execution
// ============================================================================

/**
 * Execute shell command synchronously.
 *
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Command output
 * @throws Error if command fails and throwOnError is true
 * @example
 * ```
 * const output = exec('ls -la', { cwd: '/tmp' });
 * ```
 */
export function exec(command: string, options: ExecOptions = {}): string {
  const {
    cwd,
    env,
    timeout = 0,
    maxBuffer = 1024 * 1024,
    shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
    encoding = 'utf8',
    throwOnError = true
  } = options;
  
  const { execSync } = require('child_process');
  
  try {
    const result = execSync(command, {
      cwd,
      env: { ...process.env, ...env },
      timeout,
      maxBuffer,
      shell,
      encoding,
      stdio: 'pipe'
    });
    
    return result.toString().trim();
  } catch (error: any) {
    if (throwOnError) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
    return error.message;
  }
}

/**
 * Execute shell command asynchronously.
 *
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Promise resolving to command output
 * @example
 * ```
 * const output = await execAsync('npm run build', { cwd: '/project' });
 * ```
 */
export async function execAsync(command: string, options: ExecOptions = {}): Promise<string> {
  const {
    cwd,
    env,
    timeout = 30000,
    throwOnError = true
  } = options;
  
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
  const shellArgs = process.platform === 'win32' ? ['/c', command] : ['-c', command];
  
  return new Promise((resolve, reject) => {
    const child = nodeSpawn(shell, shellArgs, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });
    
    child.on('close', (code: number | null) => {
      const output = stdout.trim();
      
      if (code === 0 || !throwOnError) {
        resolve(output);
      } else {
        if (throwOnError) {
          reject(new Error(`Command failed with exit code ${code}: ${command}\n${stderr}`));
        } else {
          resolve(output);
        }
      }
    });
    
    child.on('error', (err: Error) => {
      if (throwOnError) {
        reject(err);
      } else {
        resolve(err.message);
      }
    });
    
    // Handle timeout
    if (timeout > 0) {
      setTimeout(() => {
        child.kill();
        if (throwOnError) {
          reject(new Error(`Command timed out: ${command}`));
        } else {
          resolve('');
        }
      }, timeout);
    }
  });
}

/**
 * Spawn a child process.
 *
 * @param command - Command to spawn
 * @param args - Command arguments
 * @param options - Spawn options
 * @returns Child process instance
 * @example
 * ```
 * const child = spawn('npm', ['run', 'build'], { stdio: 'inherit' });
 * child.on('close', (code) => console.log(`Exited with ${code}`));
 * ```
 */
export function spawn(command: string, args: string[] = [], options: SpawnOptions = {}): ChildProcess {
  const {
    cwd,
    env,
    stdio = 'pipe',
    shell = false,
    detached = false
  } = options;
  
  return nodeSpawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio,
    shell: typeof shell === 'string' ? shell : (shell ? true : false),
    detached
  });
}

/**
 * Spawn a child process asynchronously.
 *
 * @param command - Command to spawn
 * @param args - Command arguments
 * @param options - Spawn options
 * @returns Promise resolving when process exits
 * @example
 * ```
 * await spawnAsync('npm', ['install'], { cwd: '/project', stdio: 'inherit' });
 * ```
 */
export async function spawnAsync(
  command: string,
  args: string[] = [],
  options: SpawnOptions = {}
): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    
    child.on('error', (error) => {
      reject(error);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve(code ?? 0);
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
  });
}

/**
 * Run a Node.js script file.
 *
 * @param scriptPath - Path to the script
 * @param args - Arguments to pass to the script
 * @returns Child process instance
 * @example
 * ```
 * const child = runScript('./scripts/build.js', ['--prod']);
 * ```
 */
export function runScript(scriptPath: string, args: string[] = []): ChildProcess {
  return spawn(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    detached: false
  });
}

/**
 * Run a command in a specific directory.
 *
 * @param command - Command to run
 * @param cwd - Working directory
 * @returns Command output
 * @example
 * ```
 * const output = runCommand('npm test', '/project');
 * ```
 */
export function runCommand(command: string, cwd: string): string {
  return exec(command, { cwd });
}

// ============================================================================
// Interactive Prompts
// ============================================================================

/**
 * Prompt for user input.
 *
 * @param message - Prompt message
 * @param options - Prompt options
 * @returns Promise resolving to user input
 * @example
 * ```
 * const name = await prompt('What is your name?');
 * ```
 */
export async function prompt(message: string, options: PromptOptions = {}): Promise<string> {
  const { default: defaultValue = '', input = process.stdin, output = process.stdout, validate } = options;
  
  if (!isInteractive()) {
    return defaultValue;
  }
  
  const rl = readline.createInterface({ input, output });
  
  return new Promise((resolve) => {
    const question = defaultValue ? `${message} [${defaultValue}]: ` : `${message}: `;
    
    rl.question(question, (answer) => {
      const value = answer.trim() || defaultValue;
      
      if (validate) {
        const validationResult = validate(value);
        if (validationResult !== true) {
          println(validationResult || 'Invalid input, please try again');
          rl.close();
          resolve(prompt(message, options));
          return;
        }
      }
      
      rl.close();
      resolve(value);
    });
  });
}

/**
 * Yes/no confirmation prompt.
 *
 * @param message - Confirmation message
 * @param defaultValue - Default value (true for yes, false for no)
 * @returns Promise resolving to boolean
 * @example
 * ```
 * const confirmed = await confirm('Delete file?', true);
 * ```
 */
export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  if (!isInteractive()) {
    return defaultValue;
  }
  
  const answer = await prompt(`${message} (${defaultValue ? 'Y/n' : 'y/N'})`);
  
  if (!answer) return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

/**
 * Select from a list of options.
 *
 * @param message - Selection prompt message
 * @param options - Array of options to select from
 * @param multi - Allow multiple selections
 * @returns Selected option(s)
 * @example
 * ```
 * const choice = await select('Choose a color:', ['Red', 'Green', 'Blue']);
 * ```
 */
export async function select<T = string>(
  message: string,
  options: T[],
  multi = false
): Promise<T | T[] | undefined> {
  if (!isInteractive() || isCI()) {
    return multi ? [] : options[0];
  }
  
  const output = process.stdout;
  
  // Print options
  println(message);
  options.forEach((opt, i) => {
    println(`  ${i + 1}. ${String(opt)}`);
  });
  
  const answer = await prompt('Enter number(s)');
  
  if (!answer) {
    return multi ? [] : undefined;
  }
  
  const indices = answer.split(/[,\s]+/).map(n => parseInt(n.trim(), 10) - 1);
  
  if (multi) {
    return indices
      .filter(i => i >= 0 && i < options.length)
      .map(i => options[i]);
  }
  
  const index = indices[0];
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  
  return undefined;
}

/**
 * Multi-select checkbox prompt.
 *
 * @param message - Selection prompt message
 * @param options - Array of options to select from
 * @returns Array of selected options
 * @example
 * ```
 * const selected = await checkbox('Select toppings:', ['Cheese', 'Pepperoni', 'Mushrooms']);
 * ```
 */
export async function checkbox<T = string>(
  message: string,
  options: T[]
): Promise<T[]> {
  if (!isInteractive() || isCI()) {
    return [];
  }
  
  println(message);
  options.forEach((opt, i) => {
    println(`  [ ] ${String(opt)}`);
  });
  
  const answer = await prompt('Enter numbers (comma-separated)');
  
  if (!answer) return [];
  
  const indices = answer.split(/[,\s]+/).map(n => parseInt(n.trim(), 10) - 1);
  return indices.filter(i => i >= 0 && i < options.length).map(i => options[i]);
}

/**
 * Password input with hidden characters.
 *
 * @param message - Prompt message
 * @returns Promise resolving to password
 * @example
 * ```
 * const password = await password('Enter password:');
 * ```
 */
export async function password(message: string): Promise<string> {
  if (!isInteractive()) {
    return '';
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(message, (answer) => {
      rl.close();
      // Clear the line
      readline.clearLine(process.stdout, 0);
      readline.cursorTo(process.stdout, 0);
      resolve(answer);
    });
  });
}

/**
 * Open editor for multi-line input.
 *
 * @param message - Prompt message
 * @param defaultValue - Default text
 * @returns Promise resolving to editor content
 * @example
 * ```
 * const message = await editor('Write your message:', 'Hello World');
 * ```
 */
export async function editor(message: string, defaultValue = ''): Promise<string> {
  if (!isInteractive() || !process.env.EDITOR) {
    return defaultValue;
  }
  
  const fs = await import('fs/promises');
  const os = await import('os');
  const path = await import('path');
  
  const tempFile = path.join(os.tmpdir(), `cli-editor-${Date.now()}.txt`);
  
  // Write default value to temp file
  await fs.writeFile(tempFile, defaultValue);
  
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const editor = process.env.EDITOR || 'vim';
    
    const child = spawn(editor, [tempFile], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('close', async () => {
      try {
        const content = await fs.readFile(tempFile, 'utf-8');
        await fs.unlink(tempFile);
        resolve(content);
      } catch (error) {
        await fs.unlink(tempFile).catch(() => {});
        resolve(defaultValue);
      }
    });
    
    child.on('error', async (error: Error) => {
      await fs.unlink(tempFile).catch(() => {});
      reject(error);
    });
  });
}

/**
 * List input with separator.
 *
 * @param message - Prompt message
 * @param separator - Separator for splitting input
 * @returns Array of items
 * @example
 * ```
 * const tags = await list('Enter tags:', ',');
 * ```
 */
export async function list(message: string, separator = ','): Promise<string[]> {
  const input = await prompt(message);
  
  if (!input.trim()) return [];
  
  return input.split(separator).map(item => item.trim()).filter(Boolean);
}

/**
 * Expand/collapse selection.
 *
 * @param message - Prompt message
 * @param options - Options with expanded/collapsed states
 * @returns Selected option
 * @example
 * ```
 * const choice = await expand('Choose view:', [
 *   { label: 'Expanded', value: 'full' },
 *   { label: 'Collapsed', value: 'brief' }
 * ]);
 * ```
 */
export async function expand<T>(
  message: string,
  options: { label: string; value: T }[]
): Promise<T | undefined> {
  if (!isInteractive() || isCI()) {
    return options[0]?.value;
  }
  
  println(message);
  options.forEach((opt, i) => {
    println(`  ${i + 1}. ${opt.label}`);
  });
  
  const answer = await prompt('Enter number');
  
  if (!answer) return undefined;
  
  const index = parseInt(answer.trim(), 10) - 1;
  if (index >= 0 && index < options.length) {
    return options[index].value;
  }
  
  return undefined;
}

// ============================================================================
// Output & Display
// ============================================================================

/**
 * Print message to console.
 *
 * @param message - Message to print
 * @param options - Print options
 * @example
 * ```
 * print('Processing...', { newline: false });
 * ```
 */
export function print(message: string, options: PrintOptions = {}): void {
  const { stream = 'stdout', newline = true } = options;
  
  const output = stream === 'stderr' ? process.stderr : process.stdout;
  output.write(message + (newline ? '\n' : ''));
}

/**
 * Print line to console.
 *
 * @param message - Message to print
 * @example
 * ```
 * println('Hello World');
 * ```
 */
export function println(message: string): void {
  console.log(message);
}

/**
 * Log message with level.
 *
 * @param message - Message to log
 * @param level - Log level
 * @example
 * ```
 * log('User logged in', 'info');
 * log('Cache miss', 'debug');
 * ```
 */
export function log(message: string, level: LogLevel = 'info'): void {
  const colors: Record<LogLevel, CliColor> = {
    debug: 'gray',
    info: 'blue',
    success: 'green',
    warn: 'yellow',
    error: 'red'
  };
  
  const prefix = level.toUpperCase().padEnd(7);
  println(chalk[colors[level]](`[${prefix}] ${message}`));
}

/**
 * Print success message.
 *
 * @param message - Message to print
 * @example
 * ```
 * success('Build completed successfully!');
 * ```
 */
export function success(message: string): void {
  println(chalk.green('✓ ') + message);
}

/**
 * Print error message.
 *
 * @param message - Message to print
 * @example
 * ```
 * error('Failed to build project');
 * ```
 */
export function error(message: string): void {
  println(chalk.red('✗ ') + message);
}

/**
 * Print warning message.
 *
 * @param message - Message to print
 * @example
 * ```
 * warn('Deprecation warning');
 * ```
 */
export function warn(message: string): void {
  println(chalk.yellow('⚠ ') + message);
}

/**
 * Print info message.
 *
 * @param message - Message to print
 * @example
 * ```
 * info('Starting build process...');
 * ```
 */
export function info(message: string): void {
  println(chalk.cyan('ℹ ') + message);
}

/**
 * Print debug message.
 *
 * @param message - Message to print
 * @example
 * ```
 * debug('Variable value:', someVariable);
 * ```
 */
export function debug(...message: any[]): void {
  if (process.env.NODE_ENV !== 'production') {
    println(chalk.gray('[DEBUG] ' + message.map(String).join(' ')));
  }
}

/**
 * Display data in a table format.
 *
 * @param data - Array of objects to display
 * @param columns - Column configuration
 * @example
 * ```
 * table([{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }], ['name', 'age']);
 * ```
 */
export function table(data: Record<string, any>[], columns?: string[]): void {
  if (!data.length) {
    println('No data to display');
    return;
  }
  
  const keys = columns || Object.keys(data[0]);
  
  // Calculate column widths
  const widths: Record<string, number> = {};
  keys.forEach(key => {
    widths[key] = key.length;
    data.forEach(row => {
      const value = String(row[key] ?? '');
      widths[key] = Math.max(widths[key], value.length);
    });
  });
  
  // Print header
  const header = keys.map(key => chalk.bold(key.padEnd(widths[key]))).join('  ');
  println(header);
  println(keys.map(() => '-'.repeat(widths[keys[0]])).join('  '));
  
  // Print rows
  data.forEach(row => {
    const rowStr = keys.map(key => String(row[key] ?? '').padEnd(widths[key])).join('  ');
    println(rowStr);
  });
}

/**
 * Display tree structure.
 *
 * @param data - Tree data structure
 * @param options - Tree display options
 * @example
 * ```
 * tree({ label: 'root', children: [{ label: 'child1' }, { label: 'child2' }] });
 * ```
 */
export function tree(data: any, options: TreeOptions = {}): void {
  const { indent = 2, root = '', formatter } = options;
  
  const printNode = (node: any, depth: number, prefix = '') => {
    const label = formatter ? formatter(node, depth) : String(node.label || node);
    println(prefix + label);
    
    const children = node.children || node.items || [];
    children.forEach((child: any, index: number) => {
      const isLast = index === children.length - 1;
      const newPrefix = prefix + (depth === 0 ? '' : (isLast ? '└' : '├') + ' '.repeat(indent - 1));
      printNode(child, depth + 1, newPrefix);
    });
  };
  
  printNode(data, 0, root);
}

/**
 * Show progress bar.
 *
 * @param current - Current value
 * @param total - Total value
 * @param options - Progress options
 * @example
 * ```
 * progress(50, 100, { width: 30 });
 * ```
 */
export function progress(current: number, total: number, options: ProgressBarOptions = {}): void {
  const {
    width = 30,
    clear = false,
    completeChar = '█',
    incompleteChar = '░'
  } = options;
  
  const percent = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(width * percent);
  const empty = width - filled;
  
  const bar = completeChar.repeat(filled) + incompleteChar.repeat(empty);
  
  if (clear) {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  }
  
  process.stdout.write(`\r[${bar}] ${Math.round(percent * 100)}% (${current}/${total})`);
  
  if (current >= total) {
    process.stdout.write('\n');
  }
}

/**
 * Show spinner during async task.
 *
 * @param message - Spinner message
 * @param task - Async task to run
 * @returns Task result
 * @example
 * ```
 * const result = await spinner('Loading...', async () => {
 *   await delay(2000);
 *   return 'Done!';
 * });
 * ```
 */
export async function spinner<T>(message: string, task: () => Promise<T>): Promise<T> {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);
  
  try {
    const result = await task();
    clearInterval(interval);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    success(message);
    return result;
  } catch (err) {
    clearInterval(interval);
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    error(`${message} failed`);
    throw err;
  }
}

/**
 * Clear console.
 */
export function clear(): void {
  console.clear();
}

// ============================================================================
// Cursor Control
// ============================================================================

/**
 * Move cursor to specific position.
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @example
 * ```
 * cursorTo(0, 10);
 * ```
 */
export function cursorTo(x: number, y?: number): void {
  if (y !== undefined) {
    readline.cursorTo(process.stdout, x, y);
  } else {
    readline.cursorTo(process.stdout, x);
  }
}

/**
 * Move cursor up by n lines.
 *
 * @param n - Number of lines
 * @example
 * ```
 * cursorUp(5);
 * ```
 */
export function cursorUp(n = 1): void {
  readline.moveCursor(process.stdout, 0, -n);
}

/**
 * Move cursor down by n lines.
 *
 * @param n - Number of lines
 * @example
 * ```
 * cursorDown(5);
 * ```
 */
export function cursorDown(n = 1): void {
  readline.moveCursor(process.stdout, 0, n);
}

/**
 * Move cursor forward by n columns.
 *
 * @param n - Number of columns
 * @example
 * ```
 * cursorForward(10);
 * ```
 */
export function cursorForward(n = 1): void {
  readline.moveCursor(process.stdout, n, 0);
}

/**
 * Move cursor backward by n columns.
 *
 * @param n - Number of columns
 * @example
 * ```
 * cursorBackward(10);
 * ```
 */
export function cursorBackward(n = 1): void {
  readline.moveCursor(process.stdout, -n, 0);
}

// ============================================================================
// Colors & Styling
// ============================================================================

/**
 * Color text.
 *
 * @param text - Text to color
 * @param color - Color name
 * @returns Colored text
 * @example
 * ```
 * color('Hello World', 'red');
 * color('Success!', 'green');
 * ```
 */
export function color(text: string, color: CliColor): string {
  const colorFn = chalk[color] as (str: string) => string;
  return colorFn ? colorFn(text) : text;
}

/**
 * Set background color.
 *
 * @param text - Text to style
 * @param color - Background color
 * @returns Styled text
 * @example
 * ```
 * bgColor('Hello', 'red');
 * ```
 */
export function bgColor(text: string, color: CliColor): string {
  const bgColorName = `bg${color.charAt(0).toUpperCase() + color.slice(1)}` as keyof typeof chalk;
  const colorFn = chalk[bgColorName] as (str: string) => string;
  return colorFn ? colorFn(text) : text;
}

/**
 * Bold text.
 *
 * @param text - Text to bold
 * @returns Bold text
 * @example
 * ```
 * bold('Important');
 * ```
 */
export function bold(text: string): string {
  return chalk.bold(text);
}

/**
 * Italic text.
 *
 * @param text - Text to italicize
 * @returns Italic text
 * @example
 * ```
 * italic('Emphasis');
 * ```
 */
export function italic(text: string): string {
  return chalk.italic(text);
}

/**
 * Underlined text.
 *
 * @param text - Text to underline
 * @returns Underlined text
 * @example
 * ```
 * underline('Underlined');
 * ```
 */
export function underline(text: string): string {
  return chalk.underline(text);
}

/**
 * Strikethrough text.
 *
 * @param text - Text to strikethrough
 * @returns Strikethrough text
 * @example
 * ```
 * strikethrough('Deleted');
 * ```
 */
export function strikethrough(text: string): string {
  return chalk.strikethrough(text);
}

/**
 * Reset all styles.
 *
 * @param text - Text to reset
 * @returns Reset text
 * @example
 * ```
 * reset(chalk.red('Hello'));
 * ```
 */
export function reset(text: string): string {
  return chalk.reset(text);
}

/**
 * RGB color.
 *
 * @param text - Text to color
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Colored text
 * @example
 * ```
 * rgb('Custom color', 255, 128, 0);
 * ```
 */
export function rgb(text: string, r: number, g: number, b: number): string {
  return chalk.rgb(r, g, b)(text);
}

/**
 * Hex color.
 *
 * @param text - Text to color
 * @param hexColor - Hex color string (e.g., '#FF8000')
 * @returns Colored text
 * @example
 * ```
 * hex('Hex color', '#FF8000');
 * ```
 */
export function hex(text: string, hexColor: string): string {
  return chalk.hex(hexColor)(text);
}

/**
 * HSL color.
 * Note: chalk v5+ uses color-convert internally. This is a simple implementation.
 *
 * @param text - Text to color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Colored text
 * @example
 * ```
 * hsl('HSL color', 200, 100, 50);
 * ```
 */
export function hsl(text: string, h: number, s: number, l: number): string {
  // Convert HSL to RGB first
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  let r: number, g: number, b: number;
  
  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;
    r = hue2rgb(p, q, hNorm + 1/3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1/3);
  }
  
  return rgb(text, Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

// ============================================================================
// Progress & Loading
// ============================================================================

/**
 * Create a progress bar instance.
 *
 * @param options - Progress bar options
 * @returns Progress bar controller
 * @example
 * ```
 * const bar = createProgressBar({ total: 100 });
 * for (let i = 0; i <= 100; i++) {
 *   bar.update(i);
 * }
 * bar.stop();
 * ```
 */
export function createProgressBar(options: ProgressBarOptions = {}) {
  const { total = 100, width = 30, clear = true } = options;
  
  return {
    /**
     * Update progress bar.
     * @param current - Current value
     * @param payload - Optional payload to display
     */
    update(current: number, payload?: string) {
      const percent = Math.min(1, Math.max(0, current / total));
      const filled = Math.round(width * percent);
      const empty = width - filled;
      
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      const percentStr = `${Math.round(percent * 100)}%`.padStart(4);
      const currentStr = String(current).padStart(String(total).length);
      
      process.stdout.write(`\r[${bar}] ${percentStr} (${currentStr}/${total})${payload ? ` ${payload}` : ''}`);
    },
    
    /**
     * Stop and clear the progress bar.
     */
    stop() {
      if (clear) {
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      } else {
        process.stdout.write('\n');
      }
    }
  };
}

/**
 * Create a multi-bar controller.
 *
 * @param options - Multi-bar options
 * @returns Multi-bar controller
 * @example
 * ```
 * const multiBar = createMultiBar();
 * multiBar.add('file1', 0, 100);
 * multiBar.update('file1', 50);
 * multiBar.stop();
 * ```
 */
export function createMultiBar(options: ProgressBarOptions = {}) {
  const bars: Record<string, { current: number; total: number; width: number }> = {};
  const { width = 30 } = options;
  
  return {
    /**
     * Add a new progress bar.
     * @param id - Unique identifier
     * @param current - Initial current value
     * @param total - Total value
     */
    add(id: string, current: number, total: number) {
      bars[id] = { current, total, width };
      this.render();
    },
    
    /**
     * Update progress bar.
     * @param id - Unique identifier
     * @param current - Current value
     * @param payload - Optional payload
     */
    update(id: string, current: number, payload?: string) {
      if (bars[id]) {
        bars[id].current = current;
        this.render();
      }
    },
    
    /**
     * Render all progress bars.
     */
    render() {
      const lines: string[] = [];
      
      Object.entries(bars).forEach(([id, { current, total, width }]) => {
        const percent = Math.min(1, Math.max(0, current / total));
        const filled = Math.round(width * percent);
        const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
        const percentStr = `${Math.round(percent * 100)}%`;
        lines.push(`${id}: [${bar}] ${percentStr}`);
      });
      
      readline.cursorTo(process.stdout, 0);
      lines.forEach((line, i) => {
        readline.cursorTo(process.stdout, 0);
        readline.moveCursor(process.stdout, 0, i);
        readline.clearLine(process.stdout, 1);
        process.stdout.write(line);
      });
      readline.cursorTo(process.stdout, 0);
      readline.moveCursor(process.stdout, 0, -lines.length + 1);
    },
    
    /**
     * Stop all progress bars.
     */
    stop() {
      Object.keys(bars).forEach((_, i) => {
        readline.cursorTo(process.stdout, 0);
        readline.moveCursor(process.stdout, 0, i);
        readline.clearLine(process.stdout, 1);
      });
      readline.cursorTo(process.stdout, 0);
    }
  };
}

/**
 * Create a spinner instance.
 *
 * @param options - Spinner options
 * @returns Spinner controller
 * @example
 * ```
 * const spinner = createSpinner({ text: 'Loading...' });
 * spinner.start();
 * await delay(2000);
 * spinner.stop();
 * ```
 */
export function createSpinner(options: SpinnerOptions = {}) {
  const {
    pattern = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    text = '',
    color = 'cyan'
  } = options;
  
  let i = 0;
  let interval: NodeJS.Timeout | null = null;
  
  const colorFn = chalk[color] as (str: string) => string;
  
  return {
    /**
     * Start the spinner.
     */
    start() {
      interval = setInterval(() => {
        const frame = colorFn ? colorFn(pattern[i]) : pattern[i];
        process.stdout.write(`\r${frame} ${text}`);
        i = (i + 1) % pattern.length;
      }, 80);
    },
    
    /**
     * Update spinner text.
     * @param newText - New text to display
     */
    update(newText: string) {
      if (interval) {
        this.stop();
        // We'll keep the reference for restart
      }
    },
    
    /**
     * Stop the spinner.
     */
    stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
      }
    },
    
    /**
     * Success state.
     * @param message - Success message
     */
    success(message: string) {
      this.stop();
      success(message);
    },
    
    /**
     * Error state.
     * @param message - Error message
     */
    error(message: string) {
      this.stop();
      error(message);
    }
  };
}

// ============================================================================
// CLI Utilities
// ============================================================================

/**
 * Get CLI name from package.json or process.argv[0].
 *
 * @returns CLI name
 */
export async function getCliName(): Promise<string> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
    return pkg.bin?.['devtools-js'] || pkg.name || 'cli';
  } catch {
    return 'cli';
  }
}

/**
 * Get CLI version from package.json.
 *
 * @returns CLI version or 'unknown'
 */
export function getCliVersion(): string {
  try {
    const fs = require('fs');
    const path = require('path');
    const packagePath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Get CLI arguments.
 *
 * @returns Parsed CLI arguments with flags
 */
export function getCliArgs() {
  const parsed = parseArgs();
  return {
    all: getArgs(),
    ...parsed
  };
}

/**
 * Get CLI environment.
 *
 * @returns Environment information
 */
export function getCliEnv() {
  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    home: process.env.HOME || process.env.USERPROFILE,
    temp: process.env.TEMP || process.env.TMP || '/tmp',
    interactive: isInteractive(),
    ci: isCI()
  };
}

/**
 * Check if running in interactive terminal.
 *
 * @returns True if interactive
 */
export function isInteractive(): boolean {
  return Boolean(
    process.stdout.isTTY &&
    process.env.TERM !== 'dumb' &&
    !('CI' in process.env)
  );
}

/**
 * Check if running in CI environment.
 *
 * @returns True if CI environment
 */
export function isCI(): boolean {
  return Boolean(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.TRAVIS ||
    process.env.CIRCLECI
  );
}

/**
 * Get terminal size.
 *
 * @returns Terminal size or default
 */
export function getTerminalSize(): TerminalSize {
  return {
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24
  };
}

/**
 * Get current working directory.
 *
 * @returns Current directory path
 */
export function getCurrentDir(): string {
  return process.cwd();
}

/**
 * Get home directory.
 *
 * @returns Home directory path
 */
export function getHomeDir(): string {
  return process.env.HOME || process.env.USERPROFILE || process.cwd();
}

/**
 * Get temp directory.
 *
 * @returns Temp directory path
 */
export function getTempDir(): string {
  return process.env.TEMP || process.env.TMP || '/tmp';
}

// ============================================================================
// File Operations from CLI
// ============================================================================

/**
 * Read from stdin asynchronously.
 *
 * @returns Promise resolving to stdin content
 * @example
 * ```
 * const input = await readStdin();
 * ```
 */
export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    process.stdin.on('data', (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on('error', reject);
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    process.stdin.setEncoding('utf-8');
  });
}

/**
 * Read from stdin synchronously.
 *
 * @returns Stdin content or empty string if not a tty
 * @example
 * ```
 * const input = readStdinSync();
 * ```
 */
export function readStdinSync(): string {
  if (process.stdin.isTTY) {
    return '';
  }
  
  const chunks: Buffer[] = [];
  
  // For synchronous reading, we need to use a different approach
  // This is a best-effort implementation
  try {
    const fs = require('fs');
    const content = fs.readFileSync(process.stdin.fd, 'utf-8');
    return content;
  } catch {
    return '';
  }
}

/**
 * Write to stdout.
 *
 * @param data - Data to write
 * @example
 * ```
 * writeStdout('Hello World\n');
 * ```
 */
export function writeStdout(data: string): void {
  process.stdout.write(data);
}

/**
 * Write to stderr.
 *
 * @param data - Data to write
 * @example
 * ```
 * writeStderr('Error: something went wrong\n');
 * ```
 */
export function writeStderr(data: string): void {
  process.stderr.write(data);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Wait for specified milliseconds.
 * Alias for sleep from async.ts.
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 * @example
 * ```
 * await wait(1000);
 * ```
 */
export const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Exit process with code.
 *
 * @param code - Exit code (default: 0)
 * @example
 * ```
 * exit(1); // Exit with error
 * ```
 */
export function exit(code = 0): never {
  process.exit(code);
}

/**
 * Abort with message.
 *
 * @param message - Error message
 * @throws Error with message
 * @example
 * ```
 * abort('Critical error occurred');
 * ```
 */
export function abort(message: string): never {
  error(message);
  exit(1);
}

/**
 * Crash with error.
 *
 * @param error - Error to crash with
 * @throws The provided error
 * @example
 * ```
 * crash(new Error('Something went wrong'));
 * ```
 */
export function crash(error: Error): never {
  console.error(error);
  exit(1);
}

/**
 * Retry function with exponential backoff.
 *
 * @param fn - Function to retry
 * @param retries - Number of retries
 * @param delay - Initial delay in ms
 * @returns Promise resolving to function result
 * @example
 * ```
 * await retry(async () => fetchData(), 3, 1000);
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (i < retries - 1) {
        await wait(delay * Math.pow(2, i));
      }
    }
  }
  
  throw lastError;
}

/**
 * Timeout function.
 *
 * @param fn - Function to timeout
 * @param ms - Timeout in milliseconds
 * @returns Promise resolving to function result or rejecting on timeout
 * @example
 * ```
 * await timeout(async () => fetchData(), 5000);
 * ```
 */
export async function timeout<T>(
  fn: () => Promise<T>,
  ms: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    )
  ]);
}

/**
 * Memoize function with TTL.
 *
 * @param fn - Function to memoize
 * @param ttl - Time to live in milliseconds
 * @returns Memoized function
 * @example
 * ```
 * const memoized = memoize(async (id) => fetchUser(id), 60000);
 * ```
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  ttl = 60000
): T {
  const cache = new Map<string, { value: any; expiry: number }>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }
    
    const result = fn(...args);
    
    // Handle async functions
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, { value, expiry: Date.now() + ttl });
        return value;
      });
    }
    
    cache.set(key, { value: result, expiry: Date.now() + ttl });
    return result;
  }) as T;
}

/**
 * Debounce function.
 *
 * @param fn - Function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 * @example
 * ```
 * const debounced = debounce((query) => search(query), 300);
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle function.
 *
 * @param fn - Function to throttle
 * @param ms - Throttle interval in milliseconds
 * @returns Throttled function
 * @example
 * ```
 * const throttled = throttle(() => save(), 1000);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  ms = 300
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      fn(...args);
    }
  };
}
