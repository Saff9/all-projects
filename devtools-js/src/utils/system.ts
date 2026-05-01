/**
 * Comprehensive Node.js system utilities for developers.
 * Provides port management, process information, system information, memory management,
 * CPU management, system operations, process control, resource monitoring, Node.js specific utilities,
 * and various system-related utility functions.
 * @module system
 */

import { spawn as nodeSpawn, exec as nodeExec, execFile as nodeExecFile, execSync, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import process from 'process';
import { fileURLToPath } from 'url';

// ============================================================================
// Type Definitions
// ============================================================================

/** Port information */
export interface PortInfo {
  /** Port number */
  port: number;
  /** Process ID using the port */
  pid?: number;
  /** Process name */
  process?: string;
  /** Protocol (tcp/udp) */
  protocol?: string;
  /** Local address */
  localAddress?: string;
  /** Foreign address */
  foreignAddress?: string;
  /** State of the connection */
  state?: string;
}

/** Process information */
export interface ProcessInfo {
  /** Process ID */
  pid: number;
  /** Parent process ID */
  ppid?: number;
  /** Process title */
  title: string;
  /** Executable path */
  execPath: string;
  /** Current working directory */
  cwd: string;
  /** Command line arguments */
  argv: string[];
  /** Environment variables */
  env: Record<string, string>;
  /** Node.js version */
  nodeVersion: string;
  /** Platform */
  platform: string;
  /** Architecture */
  arch: string;
  /** Process uptime in seconds */
  uptime: number;
  /** Memory usage */
  memoryUsage: MemoryUsage;
  /** CPU usage */
  cpuUsage?: CpuUsage;
}

/** Memory usage details */
export interface MemoryUsage {
  /** Heap used in bytes */
  heapUsed: number;
  /** Heap total in bytes */
  heapTotal: number;
  /** External memory in bytes */
  external: number;
  /** Array buffers memory */
  arrayBuffers?: number;
  /** RSS (Resident Set Size) */
  rss: number;
}

/** CPU usage details */
export interface CpuUsage {
  /** User CPU time */
  user: number;
  /** System CPU time */
  system: number;
}

/** OS information */
export interface OsInfo {
  /** OS platform */
  platform: string;
  /** OS architecture */
  arch: string;
  /** OS type */
  type: string;
  /** OS release */
  release: string;
  /** OS version */
  version: string;
  /** Hostname */
  hostname: string;
  /** Total memory in bytes */
  totalMem: number;
  /** Free memory in bytes */
  freeMem: number;
  /** CPU information */
  cpus: CpuInfo[];
  /** Network interfaces */
  networkInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]>;
  /** User info */
  userInfo: UserInfo;
  /** Load averages */
  loadAvg: number[];
  /** Temp directory */
  tmpDir: string;
  /** Endianness */
  endianness: string;
}

/** CPU information */
export interface CpuInfo {
  /** Model of the CPU */
  model: string;
  /** Speed of the CPU in MHz */
  speed: number;
  /** Times for different CPU states */
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

/** Network interface information */
export interface NetworkInterfaceInfo {
  /** Interface address */
  address: string;
  /** Interface netmask */
  netmask: string;
  /** Interface family */
  family: string;
  /** MAC address */
  mac: string;
  /** Whether this is internal */
  internal: boolean;
  /** Scope ID (for IPv6) */
  scopeid?: number;
}

/** User information */
export interface UserInfo {
  /** Username */
  username: string;
  /** UID */
  uid: number;
  /** GID */
  gid: number;
  /** Home directory */
  homedir: string;
  /** Shell */
  shell: string;
}

/** Resource usage information */
export interface ResourceUsage {
  /** CPU usage */
  cpuUsage: CpuUsage;
  /** Memory usage */
  memoryUsage: MemoryUsage;
  /** File descriptor limit */
  fdLimit: number;
  /** File descriptors open */
  fdUsage: number;
  /** Thread count */
  threadCount: number;
  /** I/O usage */
  ioUsage?: {
    readBytes: number;
    writeBytes: number;
  };
}

/** Watch options */
export interface WatchOptions {
  /** Encoding to use */
  encoding?: BufferEncoding;
  /** Whether to watch recursively */
  recursive?: boolean;
  /** Event types to watch */
  persistent?: boolean;
}

/** Process priority levels */
export type ProcessPriority = 'low' | 'normal' | 'high' | 'realtime';

/** Signal names */
export type SignalName = 'SIGABRT' | 'SIGALRM' | 'SIGBUS' | 'SIGCHLD' | 'SIGCONT' | 'SIGFPE' | 'SIGHUP' | 'SIGILL' | 'SIGINT' | 'SIGIO' | 'SIGIOT' | 'SIGKILL' | 'SIGPIPE' | 'SIGPOLL' | 'SIGPROF' | 'SIGPWR' | 'SIGSEGV' | 'SIGSTKFLT' | 'SIGSTOP' | 'SIGSYS' | 'SIGTERM' | 'SIGTRAP' | 'SIGTSTP' | 'SIGTTIN' | 'SIGTTOU' | 'SIGURG' | 'SIGUSR1' | 'SIGUSR2' | 'SIGVTALRM' | 'SIGWINCH' | 'SIGXCPU' | 'SIGXFSZ' | 'SIGBREAK' | 'SIGLOST';

// ============================================================================
// Port Management
// ============================================================================

/**
 * Get a free random port.
 * Returns a port between 1024 and 65535.
 *
 * @returns A free port number
 * @example
 * ```
 * const port = getFreePort();
 * console.log('Free port:', port);
 * ```
 */
export function getFreePort(): number {
  const port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
  return port;
}

/**
 * Get multiple free ports.
 *
 * @param start - Starting port (optional, defaults to random)
 * @param count - Number of ports to get (default: 5)
 * @returns Array of free port numbers
 * @example
 * ```
 * const ports = getFreePortRange(3000, 3);
 * // [3000, 3001, 3002]
 * ```
 */
export function getFreePortRange(start?: number, count: number = 5): number[] {
  const ports: number[] = [];
  const usedPorts = new Set<number>();

  for (let i = 0; i < count; i++) {
    let port: number;
    if (start) {
      port = start + i;
    } else {
      port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
    }

    while (usedPorts.has(port) || isPortInUse(port)) {
      port = Math.floor(Math.random() * (65535 - 1024 + 1)) + 1024;
    }

    usedPorts.add(port);
    ports.push(port);
  }

  return ports;
}

/**
 * Check if a port is in use.
 *
 * @param port - Port number to check
 * @returns True if port is in use
 * @example
 * ```
 * if (isPortInUse(3000)) {
 *   console.log('Port 3000 is in use');
 * }
 * ```
 */
export function isPortInUse(port: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const server = require('net').createServer();

    server.on('error', () => {
      resolve(true);
    });

    server.listen(port, '127.0.0.1', () => {
      server.close(() => {
        resolve(false);
      });
    });
  });
}

/**
 * Check if a port is available and return detailed information.
 *
 * @param port - Port number to check
 * @returns Object with port availability status and info
 * @example
 * ```
 * const result = checkPort(3000);
 * console.log(result); // { available: true, port: 3000 }
 * ```
 */
export async function checkPort(port: number): Promise<{ available: boolean; port: number; inUse?: PortInfo }> {
  const inUse = await isPortInUse(port);

  if (inUse) {
    const pid = await getPortPid(port);
    return {
      available: false,
      port,
      inUse: {
        port,
        pid
      }
    };
  }

  return {
    available: true,
    port
  };
}

/**
 * Wait for a port to become available.
 *
 * @param port - Port number to wait for
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @param interval - Check interval in milliseconds (default: 500)
 * @returns True if port became available, false if timeout
 * @example
 * ```
 * const available = await waitForPort(3000, 60000, 1000);
 * if (available) {
 *   console.log('Port 3000 is now available');
 * }
 * ```
 */
export async function waitForPort(
  port: number,
  timeout: number = 30000,
  interval: number = 500
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const available = !(await isPortInUse(port));
    if (available) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  return false;
}

/**
 * Kill the process using a specific port.
 *
 * @param port - Port number to kill
 * @param signal - Signal to send (default: 'SIGTERM')
 * @returns True if process was killed successfully
 * @example
 * ```
 * await killPort(3000, 'SIGKILL');
 * ```
 */
export async function killPort(port: number, signal: string = 'SIGTERM'): Promise<boolean> {
  try {
    const pid = await getPortPid(port);
    if (pid) {
      process.kill(pid, signal as NodeJS.Signals);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the PID of the process using a specific port.
 *
 * @param port - Port number to check
 * @returns PID of the process or undefined if not found
 * @example
 * ```
 * const pid = getPortPid(3000);
 * console.log('Process ID:', pid);
 * ```
 */
export async function getPortPid(port: number): Promise<number | undefined> {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      const output = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[1].includes(port.toString())) {
          const pid = parseInt(parts[4], 10);
          if (!isNaN(pid)) {
            return pid;
          }
        }
      }
    } else {
      const output = await execAsync(`lsof -i :${port} -t`);
      if (output.trim()) {
        return parseInt(output.trim().split('\n')[0], 10);
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Get detailed process information for a port.
 *
 * @param port - Port number to check
 * @returns Process information or undefined if not found
 * @example
 * ```
 * const info = await getPortProcessInfo(3000);
 * console.log('Process info:', info);
 * ```
 */
export async function getPortProcessInfo(port: number): Promise<PortInfo | undefined> {
  try {
    const pid = await getPortPid(port);
    if (!pid) {
      return undefined;
    }

    const platform = process.platform;

    if (platform === 'win32') {
      const output = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = output.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          return {
            port,
            pid,
            protocol: parts[0].toLowerCase(),
            localAddress: parts[1],
            foreignAddress: parts[2],
            state: parts[3]
          };
        }
      }
    } else {
      const output = await execAsync(`lsof -i :${port} -P -n`);
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes(`${port}`)) {
          const parts = line.trim().split(/\s+/);
          return {
            port,
            pid,
            process: parts[0],
            protocol: parts[7]?.split('/')[0] || 'tcp',
            localAddress: parts[3],
            foreignAddress: parts[4]
          };
        }
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Allocate a port, preferring a specific port but finding alternatives in range if needed.
 *
 * @param preferredPort - Preferred port number
 * @param range - Range to search around preferred port (default: 100)
 * @returns An allocated port number
 * @example
 * ```
 * const port = allocatePort(3000, 50);
 * console.log('Allocated port:', port);
 * ```
 */
export async function allocatePort(preferredPort: number, range: number = 100): Promise<number> {
  // Try preferred port first
  if (!(await isPortInUse(preferredPort))) {
    return preferredPort;
  }

  // Search in range
  const searchRadius = Math.floor(range / 2);

  for (let i = 1; i <= searchRadius; i++) {
    const lowerPort = preferredPort - i;
    const upperPort = preferredPort + i;

    if (lowerPort >= 1024 && !(await isPortInUse(lowerPort))) {
      return lowerPort;
    }

    if (upperPort <= 65535 && !(await isPortInUse(upperPort))) {
      return upperPort;
    }
  }

  // Fallback to random free port
  return getFreePort();
}

// ============================================================================
// Process Information
// ============================================================================

/**
 * Get the current process ID.
 *
 * @returns Current process ID
 * @example
 * ```
 * const pid = getProcessId();
 * console.log('Process ID:', pid);
 * ```
 */
export function getProcessId(): number {
  return process.pid;
}

/**
 * Get full process information.
 *
 * @returns Process information object
 * @example
 * ```
 * const info = getProcessInfo();
 * console.log('Process info:', info);
 * ```
 */
export function getProcessInfo(): ProcessInfo {
  return {
    pid: process.pid,
    ppid: process.ppid,
    title: process.title,
    execPath: process.execPath,
    cwd: process.cwd(),
    argv: process.argv,
    env: process.env as Record<string, string>,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memoryUsage: getMemoryUsage(),
    cpuUsage: process.cpuUsage()
  };
}

/**
 * Get the process title.
 *
 * @returns Process title
 * @example
 * ```
 * const title = getProcessTitle();
 * console.log('Title:', title);
 * ```
 */
export function getProcessTitle(): string {
  return process.title;
}

/**
 * Get Node.js version.
 *
 * @returns Node.js version string
 * @example
 * ```
 * const version = getProcessVersion();
 * console.log('Node.js version:', version);
 * ```
 */
export function getProcessVersion(): string {
  return process.version;
}

/**
 * Get all version information (Node.js, V8, etc.).
 *
 * @returns Object with version information
 * @example
 * ```
 * const versions = getProcessVersions();
 * console.log(versions); // { node: '20.0.0', v8: '11.0.0', ... }
 * ```
 */
export function getProcessVersions(): NodeJS.ProcessVersions {
  return process.versions;
}

/**
 * Get process uptime in seconds.
 *
 * @returns Uptime in seconds
 * @example
 * ```
 * const uptime = getProcessUptime();
 * console.log('Uptime:', uptime, 'seconds');
 * ```
 */
export function getProcessUptime(): number {
  return process.uptime();
}

/**
 * Get process memory usage.
 *
 * @returns Memory usage object
 * @example
 * ```
 * const usage = getProcessMemoryUsage();
 * console.log('Heap used:', usage.heapUsed);
 * ```
 */
export function getProcessMemoryUsage(): NodeJS.MemoryUsage {
  return process.memoryUsage();
}

/**
 * Get process CPU usage.
 *
 * @returns CPU usage object with user and system properties
 * @example
 * ```
 * const usage = getProcessCpuUsage();
 * console.log('User CPU:', usage.user);
 * console.log('System CPU:', usage.system);
 * ```
 */
export function getProcessCpuUsage(): NodeJS.CpuUsage {
  return process.cpuUsage();
}

/**
 * Get open handles for the current process.
 *
 * @returns Array of handle information
 * @example
 * ```
 * const handles = getProcessHandles();
 * console.log('Open handles:', handles.length);
 * ```
 */
export function getProcessHandles(): { type: string; fd?: number; path?: string }[] {
  const handles: { type: string; fd?: number; path?: string }[] = [];

  try {
    // This is a best-effort approach as there's no direct API
    const fds = fs.readdirSync('/proc/self/fd');
    for (const fd of fds) {
      try {
        const link = fs.readlinkSync(`/proc/self/fd/${fd}`);
        handles.push({
          type: link.startsWith('/') ? 'file' : 'socket',
          fd: parseInt(fd, 10),
          path: link
        });
      } catch {
        handles.push({ type: 'unknown', fd: parseInt(fd, 10) });
      }
    }
  } catch {
    // On Windows or if /proc not available
    // Try to get file descriptors on Windows
    if (process.platform === 'win32') {
      // Windows doesn't expose this easily
    }
  }

  return handles;
}

/**
 * Get loaded modules in the current process.
 *
 * @returns Object with module paths and their cache status
 * @example
 * ```
 * const modules = getProcessModules();
 * console.log('Loaded modules:', Object.keys(modules));
 * ```
 */
export function getProcessModules(): Record<string, boolean> {
  const modules: Record<string, boolean> = {};

  for (const id of Object.keys(require.cache || {})) {
    modules[id] = true;
  }

  return modules;
}

/**
 * Get environment variables.
 *
 * @returns Environment variables object
 * @example
 * ```
 * const env = getProcessEnv();
 * console.log('PATH:', env.PATH);
 * ```
 */
export function getProcessEnv(): Record<string, string | undefined> {
  return { ...process.env };
}

/**
 * Get current working directory.
 *
 * @returns Current working directory
 * @example
 * ```
 * const cwd = getProcessCwd();
 * console.log('Working directory:', cwd);
 * ```
 */
export function getProcessCwd(): string {
  return process.cwd();
}

/**
 * Get executable path.
 *
 * @returns Executable path
 * @example
 * ```
 * const execPath = getProcessExecPath();
 * console.log('Executable:', execPath);
 * ```
 */
export function getProcessExecPath(): string {
  return process.execPath;
}

/**
 * Get command line arguments.
 *
 * @returns Command line arguments array
 * @example
 * ```
 * const argv = getProcessArgv();
 * console.log('Args:', argv);
 * ```
 */
export function getProcessArgv(): string[] {
  return [...process.argv];
}

/**
 * Get process exit code.
 *
 * @returns Exit code or undefined if still running
 * @example
 * ```
 * const exitCode = getProcessExitCode();
 * console.log('Exit code:', exitCode);
 * ```
 */
export function getProcessExitCode(): number | undefined {
  return (process as any).exitCode;
}

// ============================================================================
// System Information
// ============================================================================

/**
 * Get comprehensive OS information.
 *
 * @returns OS information object
 * @example
 * ```
 * const info = getOsInfo();
 * console.log('OS:', info.type, info.release);
 * ```
 */
export function getOsInfo(): OsInfo {
  return {
    platform: os.platform(),
    arch: os.arch(),
    type: os.type(),
    release: os.release(),
    version: os.version(),
    hostname: os.hostname(),
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    cpus: os.cpus(),
    networkInterfaces: os.networkInterfaces(),
    userInfo: {
      username: os.userInfo().username,
      uid: os.userInfo().uid,
      gid: os.userInfo().gid,
      homedir: os.userInfo().homedir,
      shell: os.userInfo().shell || ''
    },
    loadAvg: os.loadavg(),
    tmpDir: os.tmpdir(),
    endianness: os.endianness()
  };
}

/**
 * Get OS platform.
 *
 * @returns OS platform (linux, darwin, win32, etc.)
 * @example
 * ```
 * const platform = getOsPlatform();
 * console.log('Platform:', platform);
 * ```
 */
export function getOsPlatform(): string {
  return os.platform();
}

/**
 * Get OS architecture.
 *
 * @returns OS architecture (arm, arm64, ia32, x64, etc.)
 * @example
 * ```
 * const arch = getOsArch();
 * console.log('Architecture:', arch);
 * ```
 */
export function getOsArch(): string {
  return os.arch();
}

/**
 * Get OS version.
 *
 * @returns OS version string
 * @example
 * ```
 * const version = getOsVersion();
 * console.log('OS version:', version);
 * ```
 */
export function getOsVersion(): string {
  return os.version();
}

/**
 * Get OS release.
 *
 * @returns OS release string
 * @example
 * ```
 * const release = getOsRelease();
 * console.log('OS release:', release);
 * ```
 */
export function getOsRelease(): string {
  return os.release();
}

/**
 * Get OS type.
 *
 * @returns OS type (Linux, Darwin, Windows_NT, etc.)
 * @example
 * ```
 * const type = getOsType();
 * console.log('OS type:', type);
 * ```
 */
export function getOsType(): string {
  return os.type();
}

/**
 * Get CPU endianness.
 *
 * @returns CPU endianness (LE or BE)
 * @example
 * ```
 * const endianness = getOsEndianness();
 * console.log('Endianness:', endianness);
 * ```
 */
export function getOsEndianness(): string {
  return os.endianness();
}

/**
 * Get hostname.
 *
 * @returns Hostname string
 * @example
 * ```
 * const hostname = getOsHostname();
 * console.log('Hostname:', hostname);
 * ```
 */
export function getOsHostname(): string {
  return os.hostname();
}

/**
 * Get total memory in bytes.
 *
 * @returns Total memory in bytes
 * @example
 * ```
 * const totalMem = getOsTotalMem();
 * console.log('Total memory:', totalMem, 'bytes');
 * ```
 */
export function getOsTotalMem(): number {
  return os.totalmem();
}

/**
 * Get free memory in bytes.
 *
 * @returns Free memory in bytes
 * @example
 * ```
 * const freeMem = getOsFreeMem();
 * console.log('Free memory:', freeMem, 'bytes');
 * ```
 */
export function getOsFreeMem(): number {
  return os.freemem();
}

/**
 * Get CPU information.
 *
 * @returns Array of CPU information objects
 * @example
 * ```
 * const cpus = getOsCpus();
 * console.log('CPU count:', cpus.length);
 * console.log('CPU model:', cpus[0].model);
 * ```
 */
export function getOsCpus(): CpuInfo[] {
  return os.cpus() as CpuInfo[];
}

/**
 * Get network interfaces.
 *
 * @returns Object with network interface names as keys
 * @example
 * ```
 * const interfaces = getOsNetworkInterfaces();
 * console.log('Interfaces:', Object.keys(interfaces));
 * ```
 */
export function getOsNetworkInterfaces(): NodeJS.Dict<NetworkInterfaceInfo[]> {
  return os.networkInterfaces();
}

/**
 * Get user information.
 *
 * @returns User information object
 * @example
 * ```
 * const user = getOsUserInfo();
 * console.log('Username:', user.username);
 * ```
 */
export function getOsUserInfo(): UserInfo {
  return os.userInfo() as UserInfo;
}

/**
 * Get load averages.
 *
 * @returns Array of load averages (1, 5, 15 minutes)
 * @example
 * ```
 * const loadAvg = getOsLoadAvg();
 * console.log('Load avg (1m):', loadAvg[0]);
 * ```
 */
export function getOsLoadAvg(): number[] {
  return os.loadavg();
}

/**
 * Get temp directory.
 *
 * @returns Temp directory path
 * @example
 * ```
 * const tmpDir = getOsTmpDir();
 * console.log('Temp dir:', tmpDir);
 * ```
 */
export function getOsTmpDir(): string {
  return os.tmpdir();
}

/**
 * Get available signals.
 *
 * @returns Array of available signal names
 * @example
 * ```
 * const signals = getOsSignals();
 * console.log('Available signals:', signals);
 * ```
 */
export function getOsSignals(): SignalName[] {
  return [
    'SIGABRT', 'SIGALRM', 'SIGBUS', 'SIGCHLD', 'SIGCONT', 'SIGFPE',
    'SIGHUP', 'SIGILL', 'SIGINT', 'SIGIO', 'SIGIOT', 'SIGKILL',
    'SIGPIPE', 'SIGPOLL', 'SIGPROF', 'SIGPWR', 'SIGSEGV', 'SIGSTKFLT',
    'SIGSTOP', 'SIGSYS', 'SIGTERM', 'SIGTRAP', 'SIGTSTP', 'SIGTTIN',
    'SIGTTOU', 'SIGURG', 'SIGUSR1', 'SIGUSR2', 'SIGVTALRM', 'SIGWINCH',
    'SIGXCPU', 'SIGXFSZ', 'SIGBREAK', 'SIGLOST'
  ];
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Get memory usage in bytes.
 *
 * @returns Memory usage object with rss, heapUsed, heapTotal, external
 * @example
 * ```
 * const usage = getMemoryUsage();
 * console.log('RSS:', usage.rss);
 * console.log('Heap used:', usage.heapUsed);
 * ```
 */
export function getMemoryUsage(): MemoryUsage {
  const usage = process.memoryUsage();
  return {
    rss: usage.rss,
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers
  };
}

/**
 * Get heap used memory.
 *
 * @returns Heap used memory in bytes
 * @example
 * ```
 * const heapUsed = getHeapUsed();
 * console.log('Heap used:', heapUsed, 'bytes');
 * ```
 */
export function getHeapUsed(): number {
  return process.memoryUsage().heapUsed;
}

/**
 * Get heap total memory.
 *
 * @returns Heap total memory in bytes
 * @example
 * ```
 * const heapTotal = getHeapTotal();
 * console.log('Heap total:', heapTotal, 'bytes');
 * ```
 */
export function getHeapTotal(): number {
  return process.memoryUsage().heapTotal;
}

/**
 * Get external memory.
 *
 * @returns External memory in bytes
 * @example
 * ```
 * const external = getExternalMemory();
 * console.log('External:', external, 'bytes');
 * ```
 */
export function getExternalMemory(): number {
  return process.memoryUsage().external;
}

/**
 * Get array buffers memory.
 *
 * @returns Array buffers memory in bytes
 * @example
 * ```
 * const arrayBuffers = getArrayBuffersMemory();
 * console.log('Array buffers:', arrayBuffers, 'bytes');
 * ```
 */
export function getArrayBuffersMemory(): number {
  return process.memoryUsage().arrayBuffers || 0;
}

/**
 * Get detailed memory information.
 *
 * @returns Detailed memory information
 * @example
 * ```
 * const info = getMemoryInfo();
 * console.log('Detailed memory info:', info);
 * ```
 */
export function getMemoryInfo(): {
  usage: MemoryUsage;
  percentages: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
  };
  systemMemory: {
    total: number;
    free: number;
    used: number;
    percentUsed: number;
  };
} {
  const usage = getMemoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    usage,
    percentages: {
      heapUsed: (usage.heapUsed / usage.heapTotal) * 100,
      heapTotal: 100,
      rss: (usage.rss / totalMem) * 100
    },
    systemMemory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      percentUsed: (usedMem / totalMem) * 100
    }
  };
}

/**
 * Force garbage collection if available.
 * Note: This requires --expose-gc flag.
 *
 * @example
 * ```
 * forceGc();
 * ```
 */
export function forceGc(): void {
  if (global.gc) {
    global.gc();
  }
}

/**
 * Get memory limit (if set).
 *
 * @returns Memory limit in bytes or undefined if not set
 * @example
 * ```
 * const limit = getMemoryLimit();
 * console.log('Memory limit:', limit);
 * ```
 */
export function getMemoryLimit(): number | undefined {
  const limit = process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/);
  if (limit) {
    return parseInt(limit[1], 10) * 1024 * 1024;
  }
  return undefined;
}

/**
 * Monitor memory usage over time.
 *
 * @param interval - Sampling interval in milliseconds (default: 1000)
 * @returns Async generator that yields memory usage snapshots
 * @example
 * ```
 * for await (const snapshot of monitorMemory(500)) {
 *   console.log('Heap used:', snapshot.heapUsed);
 * }
 * ```
 */
export async function* monitorMemory(interval: number = 1000): AsyncGenerator<MemoryUsage> {
  while (true) {
    yield getMemoryUsage();
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Get memory usage percentage.
 *
 * @returns Memory usage percentage (0-100)
 * @example
 * ```
 * const percent = getMemoryUsagePercent();
 * console.log('Memory usage:', percent.toFixed(2), '%');
 * ```
 */
export function getMemoryUsagePercent(): number {
  const usage = process.memoryUsage();
  const totalMem = os.totalmem();
  return (usage.rss / totalMem) * 100;
}

// ============================================================================
// CPU Management
// ============================================================================

/**
 * Get CPU usage.
 *
 * @returns CPU usage object
 * @example
 * ```
 * const usage = getCpuUsage();
 * console.log('User CPU:', usage.user);
 * console.log('System CPU:', usage.system);
 * ```
 */
export function getCpuUsage(): NodeJS.CpuUsage {
  return process.cpuUsage();
}

/**
 * Get CPU information.
 *
 * @returns Array of CPU information objects
 * @example
 * ```
 * const cpuInfo = getCpuInfo();
 * console.log('CPU count:', cpuInfo.length);
 * ```
 */
export function getCpuInfo(): CpuInfo[] {
  return os.cpus() as CpuInfo[];
}

/**
 * Get number of CPUs.
 *
 * @returns Number of CPUs
 * @example
 * ```
 * const count = getCpuCount();
 * console.log('CPU count:', count);
 * ```
 */
export function getCpuCount(): number {
  return os.cpus().length;
}

/**
 * Get CPU speed.
 *
 * @returns CPU speed in MHz
 * @example
 * ```
 * const speed = getCpuSpeed();
 * console.log('CPU speed:', speed, 'MHz');
 * ```
 */
export function getCpuSpeed(): number {
  const cpus = os.cpus();
  return cpus.length > 0 ? cpus[0].speed : 0;
}

/**
 * Monitor CPU usage over time.
 *
 * @param interval - Sampling interval in milliseconds (default: 1000)
 * @returns Async generator that yields CPU usage snapshots
 * @example
 * ```
 * for await (const snapshot of monitorCpu(500)) {
 *   console.log('CPU usage:', snapshot);
 * }
 * ```
 */
export async function* monitorCpu(interval: number = 1000): AsyncGenerator<{ user: number; system: number; percent: number }> {
  let lastUsage = process.cpuUsage();
  const cpuCount = os.cpus().length;

  while (true) {
    await new Promise(resolve => setTimeout(resolve, interval));
    const currentUsage = process.cpuUsage();
    const diffUser = currentUsage.user - lastUsage.user;
    const diffSystem = currentUsage.system - lastUsage.system;
    const totalDiff = diffUser + diffSystem;
    const percent = (totalDiff / (interval * 1000 * cpuCount)) * 100;

    lastUsage = currentUsage;
    yield {
      user: diffUser,
      system: diffSystem,
      percent: Math.min(100, Math.max(0, percent))
    };
  }
}

/**
 * Get load averages.
 *
 * @returns Array of load averages (1, 5, 15 minutes)
 * @example
 * ```
 * const load = getLoadAverage();
 * console.log('1m load:', load[0]);
 * ```
 */
export function getLoadAverage(): number[] {
  return os.loadavg();
}

// ============================================================================
// System Operations
// ============================================================================

/**
 * Get system time.
 *
 * @returns System time object with date and ISO string
 * @example
 * ```
 * const time = getSystemTime();
 * console.log('Current time:', time.date);
 * ```
 */
export function getSystemTime(): { date: Date; iso: string; timestamp: number } {
  const date = new Date();
  return {
    date,
    iso: date.toISOString(),
    timestamp: date.getTime()
  };
}

/**
 * Get system uptime.
 *
 * @returns System uptime in seconds
 * @example
 * ```
 * const uptime = getSystemUptime();
 * console.log('System uptime:', uptime, 'seconds');
 * ```
 */
export function getSystemUptime(): number {
  return os.uptime();
}

/**
 * Get system endianness.
 *
 * @returns System endianness (LE or BE)
 * @example
 * ```
 * const endianness = getSystemEndianness();
 * console.log('Endianness:', endianness);
 * ```
 */
export function getSystemEndianness(): string {
  return os.endianness();
}

// ============================================================================
// Process Control
// ============================================================================

/**
 * Exit the process with a specific code.
 *
 * @param code - Exit code (default: 0)
 * @example
 * ```
 * exit(1);
 * ```
 */
export function exit(code: number = 0): never {
  process.exit(code);
}

/**
 * Send a signal to a process.
 *
 * @param pid - Process ID
 * @param signal - Signal name (default: 'SIGTERM')
 * @returns True if signal was sent successfully
 * @example
 * ```
 * kill(12345, 'SIGINT');
 * ```
 */
export function kill(pid: number, signal: string = 'SIGTERM'): boolean {
  try {
    process.kill(pid, signal as NodeJS.Signals);
    return true;
  } catch {
    return false;
  }
}

/**
 * Kill a process and all its children.
 *
 * @param pid - Process ID to kill
 * @param signal - Signal to send (default: 'SIGTERM')
 * @returns True if successful
 * @example
 * ```
 * killTree(12345, 'SIGKILL');
 * ```
 */
export async function killTree(pid: number, signal: string = 'SIGTERM'): Promise<boolean> {
  try {
    const platform = process.platform;

    if (platform === 'win32') {
      await execAsync(`taskkill /F /T /PID ${pid}`);
    } else {
      // Find all child processes
      const output = await execAsync(`pgrep -P ${pid}`);
      const childPids = output.trim().split('\n').filter(Boolean).map(Number);

      // Recursively kill children
      for (const childPid of childPids) {
        await killTree(childPid, signal);
      }

      // Kill the main process
      process.kill(pid, signal as NodeJS.Signals);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Spawn a new process.
 *
 * @param command - Command to execute
 * @param args - Command arguments
 * @param options - Spawn options
 * @returns Child process instance
 * @example
 * ```
 * const child = spawn('node', ['script.js'], { cwd: '/app' });
 * ```
 */
export function spawn(command: string, args: string[] = [], options: {
  cwd?: string;
  env?: Record<string, string>;
  stdio?: 'pipe' | 'ignore' | 'inherit' | 'inherit:pipe';
  shell?: boolean | string;
  detached?: boolean;
  timeout?: number;
} = {}): ChildProcess {
  const spawnOptions: any = {
    cwd: options.cwd,
    env: options.env,
    stdio: options.stdio || 'pipe',
    shell: options.shell || false,
    detached: options.detached || false
  };

  const child = require('child_process').spawn(command, args, spawnOptions);

  if (options.timeout) {
    setTimeout(() => {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }, options.timeout);
  }

  return child;
}

/**
 * Execute a command and return its output.
 *
 * @param command - Command to execute
 * @param options - Execution options
 * @returns Object with stdout, stderr, and exit code
 * @example
 * ```
 * const result = await exec('ls -la', { timeout: 5000 });
 * console.log(result.stdout);
 * ```
 */
export function exec(command: string, options: {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  maxBuffer?: number;
  encoding?: string;
} = {}): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    nodeExec(command, {
      cwd: options.cwd,
      env: options.env,
      timeout: options.timeout,
      maxBuffer: options.maxBuffer || 1024 * 1024,
      encoding: options.encoding || 'utf8'
    } as any, (error: any, stdout: string, stderr: string) => {
      const exitCode = error?.code || 0;
      resolve({ stdout, stderr, exitCode });
    });
  });
}

/**
 * Execute a file with arguments.
 *
 * @param file - File to execute
 * @param args - Arguments to pass
 * @param options - Execution options
 * @returns Object with stdout, stderr, and exit code
 * @example
 * ```
 * const result = await execFile('node', ['script.js']);
 * console.log(result.stdout);
 * ```
 */
export function execFile(file: string, args: string[] = [], options: {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  maxBuffer?: number;
  encoding?: string;
} = {}): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    nodeExecFile(file, args, {
      cwd: options.cwd,
      env: options.env,
      timeout: options.timeout,
      maxBuffer: options.maxBuffer || 1024 * 1024,
      encoding: options.encoding || 'utf8'
    } as any, (error: any, stdout: string, stderr: string) => {
      const exitCode = error?.code || 0;
      resolve({ stdout, stderr, exitCode });
    });
  });
}

// ============================================================================
// Resource Monitoring
// ============================================================================

/**
 * Get resource usage for the current process.
 *
 * @returns Resource usage information
 * @example
 * ```
 * const usage = getResourceUsage();
 * console.log('CPU usage:', usage.cpuUsage);
 * console.log('Memory usage:', usage.memoryUsage);
 * ```
 */
export function getResourceUsage(): ResourceUsage {
  const cpuUsage = process.cpuUsage();
  const memoryUsage = process.memoryUsage();

  let fdUsage = 0;
  let threadCount = 0;

  try {
    if (process.platform !== 'win32') {
      fdUsage = fs.readdirSync('/proc/self/fd').length;
    }
  } catch {
    fdUsage = -1;
  }

  // Note: Thread count is not easily accessible in Node.js
  // This is a placeholder that returns -1 on unsupported platforms
  threadCount = -1;

  return {
    cpuUsage,
    memoryUsage: memoryUsage as NodeJS.MemoryUsage,
    fdLimit: -1, // Would require os.userInfo().uid lookup
    fdUsage,
    threadCount,
    ioUsage: {
      readBytes: 0,
      writeBytes: 0
    }
  };
}

/**
 * Get file descriptor limit.
 *
 * @returns File descriptor limit or -1 if unknown
 * @example
 * ```
 * const limit = getFdLimit();
 * console.log('FD limit:', limit);
 * ```
 */
export function getFdLimit(): number {
  try {
    if (process.platform === 'win32') {
      return -1;
    }
    const output = fs.readFileSync('/proc/self/limits', 'utf8');
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.startsWith('Max open files')) {
        const parts = line.split(/\s+/);
        return parseInt(parts[2], 10);
      }
    }
  } catch {
    return -1;
  }
  return -1;
}

/**
 * Get file descriptor usage.
 *
 * @returns Number of open file descriptors or -1 if unknown
 * @example
 * ```
 * const usage = getFdUsage();
 * console.log('Open FDs:', usage);
 * ```
 */
export function getFdUsage(): number {
  try {
    if (process.platform === 'win32') {
      return -1;
    }
    return fs.readdirSync('/proc/self/fd').length;
  } catch {
    return -1;
  }
}

/**
 * Get thread count.
 *
 * @returns Thread count or -1 if unknown
 * @example
 * ```
 * const count = getThreadCount();
 * console.log('Thread count:', count);
 * ```
 */
export function getThreadCount(): number {
  // Note: Node.js doesn't expose thread count directly
  // This returns -1 as thread count is not easily accessible
  return -1;
}

/**
 * Get I/O usage.
 *
 * @returns I/O usage object or undefined if not available
 * @example
 * ```
 * const io = getIoUsage();
 * console.log('Read bytes:', io?.readBytes);
 * console.log('Write bytes:', io?.writeBytes);
 * ```
 */
export function getIoUsage(): { readBytes: number; writeBytes: number } | undefined {
  // Note: Detailed I/O stats are not available in standard Node.js
  // This returns undefined as I/O usage requires OS-specific APIs
  return undefined;
}

// ============================================================================
// Node.js Specific
// ============================================================================

/**
 * Get Node.js executable path.
 *
 * @returns Node.js executable path
 * @example
 * ```
 * const nodePath = getNodePath();
 * console.log('Node.js:', nodePath);
 * ```
 */
export function getNodePath(): string {
  return process.execPath;
}

/**
 * Get node_modules path.
 *
 * @param cwd - Starting directory (default: current working directory)
 * @returns node_modules path or undefined if not found
 * @example
 * ```
 * const modulesPath = getNodeModulesPath('/app');
 * console.log('node_modules:', modulesPath);
 * ```
 */
export function getNodeModulesPath(cwd: string = process.cwd()): string | undefined {
  const modulesPath = path.join(cwd, 'node_modules');
  if (fs.existsSync(modulesPath)) {
    return modulesPath;
  }
  return undefined;
}

/**
 * Get npm executable path.
 *
 * @returns npm executable path or undefined if not found
 * @example
 * ```
 * const npmPath = getNpmPath();
 * console.log('npm:', npmPath);
 * ```
 */
export function getNpmPath(): string | undefined {
  try {
    const npmPath = require.resolve('npm/bin/npm-cli.js');
    return npmPath;
  } catch {
    return undefined;
  }
}

/**
 * Get package.json contents.
 *
 * @param cwd - Starting directory (default: current working directory)
 * @returns Parsed package.json or undefined if not found
 * @example
 * ```
 * const pkg = getPackageJson('/app');
 * console.log('Package name:', pkg?.name);
 * ```
 */
export function getPackageJson(cwd: string = process.cwd()): Record<string, any> | undefined {
  try {
    const packageJsonPath = path.join(cwd, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const content = fs.readFileSync(packageJsonPath, 'utf8');
      return JSON.parse(content);
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/**
 * Resolve a module path.
 *
 * @param module - Module name or path
 * @returns Resolved module path or undefined if not found
 * @example
 * ```
 * const resolved = requireResolved('lodash');
 * console.log('Module path:', resolved);
 * ```
 */
export function requireResolved(module: string): string | undefined {
  try {
    return require.resolve(module);
  } catch {
    return undefined;
  }
}

/**
 * Get require cache.
 *
 * @returns Object with cached module paths as keys
 * @example
 * ```
 * const cache = getRequireCache();
 * console.log('Cached modules:', Object.keys(cache));
 * ```
 */
export function getRequireCache(): Record<string, any> {
  return require.cache || {};
}

/**
 * Clear require cache for a specific module.
 *
 * @param modulePath - Path to the module to clear
 * @returns True if cache was cleared
 * @example
 * ```
 * clearRequireCache('/app/node_modules/mymodule');
 * ```
 */
export function clearRequireCache(modulePath: string): boolean {
  try {
    const cache = require.cache;
    if (cache) {
      // Clear the module itself
      delete cache[modulePath];

      // Clear any children of this module
      for (const key of Object.keys(cache)) {
        const mod = cache[key];
        if (mod?.children && mod.children.some((child: any) => child.id === modulePath)) {
          delete cache[key];
        }
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if running as administrator (Windows).
 *
 * @returns True if running as admin
 * @example
 * ```
 * if (isAdmin()) {
 *   console.log('Running as admin');
 * }
 * ```
 */
export function isAdmin(): boolean {
  if (process.platform === 'win32') {
    try {
      const output = execSync('net session', { encoding: 'utf8', stdio: 'pipe' });
      return output.includes('The command completed successfully');
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Check if running as root.
 *
 * @returns True if running as root
 * @example
 * ```
 * if (isRoot()) {
 *   console.log('Running as root');
 * }
 * ```
 */
export function isRoot(): boolean {
  return process.getuid?.() === 0 || false;
}

/**
 * Get current user ID.
 *
 * @returns Current user ID or -1 if unknown
 * @example
 * ```
 * const uid = getCurrentUid();
 * console.log('User ID:', uid);
 * ```
 */
export function getCurrentUid(): number {
  return process.getuid?.() || -1;
}

/**
 * Get current group ID.
 *
 * @returns Current group ID or -1 if unknown
 * @example
 * ```
 * const gid = getCurrentGid();
 * console.log('Group ID:', gid);
 * ```
 */
export function getCurrentGid(): number {
  return process.getgid?.() || -1;
}

/**
 * Get process priority.
 *
 * @returns Process priority or undefined if not available
 * @example
 * ```
 * const priority = getProcessPriority();
 * console.log('Priority:', priority);
 * ```
 */
export function getProcessPriority(): string | undefined {
  try {
    if (process.platform === 'win32') {
      return 'normal'; // Windows doesn't expose priority easily
    }
    const output = execSync(`ps -p ${process.pid} -o pri=`, { encoding: 'utf8' });
    return `priority-${output.trim()}`;
  } catch {
    return undefined;
  }
}

/**
 * Set process priority.
 *
 * @param priority - Priority to set
 * @returns True if successful
 * @example
 * ```
 * setProcessPriority('high');
 * ```
 */
export function setProcessPriority(priority: ProcessPriority): boolean {
  try {
    if (process.platform === 'win32') {
      return false; // Windows priority requires Windows API
    }
    const niceValue: Record<ProcessPriority, number> = {
      low: 19,
      normal: 0,
      high: -10,
      realtime: -20
    };
    execSync(`renice ${niceValue[priority]} ${process.pid}`, { encoding: 'utf8' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Daemonize a script (run in background).
 *
 * @param scriptPath - Path to the script to daemonize
 * @param args - Arguments to pass to the script
 * @returns Child process (detached)
 * @example
 * ```
 * const child = daemonize('/app/server.js', ['--port', '3000']);
 * console.log('Daemon started with PID:', child.pid);
 * ```
 */
export function daemonize(scriptPath: string, args: string[] = []): ChildProcess {
  const platform = process.platform;

  if (platform === 'win32') {
    // On Windows, use spawn with detached option
    const child = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    return child;
  } else {
    // On Unix-like systems, use double-fork
    const child = spawn('node', [scriptPath, ...args], {
      detached: true,
      stdio: 'ignore',
      cwd: process.cwd()
    });
    child.unref();
    return child;
  }
}

/**
 * Get process tree (current process and ancestors).
 *
 * @returns Array of process info from current to init
 * @example
 * ```
 * const tree = getProcessTree();
 * console.log('Process tree:', tree);
 * ```
 */
export function getProcessTree(): { pid: number; ppid: number; command: string }[] {
  const tree: { pid: number; ppid: number; command: string }[] = [];
  let currentPid = process.pid;

  while (currentPid > 0) {
    try {
      if (process.platform === 'win32') {
        const output = execSync(`wmic process where (processid=${currentPid}) get processid,parentprocessid,commandline`, {
          encoding: 'utf8',
          stdio: 'pipe'
        });
        const lines = output.split('\n').filter(Boolean);
        if (lines.length > 1) {
          const parts = lines[1].trim().split(/\s+/);
          const ppid = parseInt(parts[1], 10);
          const command = parts.slice(2).join(' ') || 'unknown';
          tree.push({ pid: currentPid, ppid, command });
          currentPid = isNaN(ppid) ? 0 : ppid;
        } else {
          break;
        }
      } else {
        const cmdline = fs.readFileSync(`/proc/${currentPid}/cmdline`, 'utf8').replace(/\0/g, ' ').trim();
        const stat = fs.readFileSync(`/proc/${currentPid}/stat`, 'utf8');
        const ppid = parseInt(stat.split(' ')[3], 10);
        tree.push({ pid: currentPid, ppid, command: cmdline || 'unknown' });
        currentPid = isNaN(ppid) ? 0 : ppid;
      }
    } catch {
      break;
    }
  }

  return tree;
}

/**
 * Watch a file for changes.
 *
 * @param path - File path to watch
 * @param options - Watch options
 * @returns FSWatcher instance
 * @example
 * ```
 * const watcher = watchFile('/app/config.json', { encoding: 'utf8' });
 * watcher.on('change', (event) => {
 *   console.log('File changed:', event);
 * });
 * ```
 */
export function watchFile(path: string, options?: {
  encoding?: BufferEncoding;
  persistent?: boolean;
}): fs.FSWatcher {
  return fs.watch(path, {
    encoding: options?.encoding || 'utf8',
    persistent: options?.persistent !== false
  });
}

/**
 * Watch a directory for changes.
 *
 * @param path - Directory path to watch
 * @param options - Watch options
 * @returns FSWatcher instance
 * @example
 * ```
 * const watcher = watchDir('/app/src', { recursive: true });
 * watcher.on('change', (event, filename) => {
 *   console.log('Directory changed:', event, filename);
 * });
 * ```
 */
export function watchDir(path: string, options?: {
  encoding?: BufferEncoding;
  recursive?: boolean;
  persistent?: boolean;
}): fs.FSWatcher {
  return fs.watch(path, {
    encoding: options?.encoding || 'utf8',
    recursive: options?.recursive || false,
    persistent: options?.persistent !== false
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function to execute commands asynchronously.
 */
function execAsync(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    nodeExec(command, { encoding: 'utf8', maxBuffer: 1024 * 1024 } as any, (error: any, stdout: string, stderr: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout || stderr);
      }
    });
  });
}
