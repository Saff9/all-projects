/**
 * Comprehensive file system utilities for developers.
 * Provides file reading, writing, operations, directory management,
 * path utilities, file information, symlinks, temporary files,
 * search functionality, and more.
 * @module fs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Readable } from 'stream';

// ============================================================================
// Type Definitions
// ============================================================================

/** File encoding options */
export type FileEncoding = 'utf8' | 'utf-16le' | 'ucs2' | 'ascii' | 'base64' | 'hex' | 'latin1' | 'binary';

/** Options for reading/writing JSON files */
export interface JsonFileOptions {
  /** Space indentation for formatting */
  space?: string | number;
  /** EOL character */
  eol?: string;
}

/** Options for reading/writing CSV files */
export interface CsvOptions {
  /** Delimiter character */
  delimiter?: string;
  /** Quote character */
  quote?: string;
  /** Whether to include header row */
  header?: boolean;
  /** Column names */
  columns?: string[];
  /** Whether to trim values */
  trim?: boolean;
  /** Encoding to use */
  encoding?: FileEncoding;
}

/** Options for reading/writing YAML files */
export interface YamlOptions {
  /** Indentation level */
  indent?: number;
  /** Whether to use single quotes */
  singleQuote?: boolean;
  /** Whether to sort keys */
  sortKeys?: boolean;
}

/** File information interface */
export interface FileInfo {
  /** Full path to the file */
  path: string;
  /** File name */
  name: string;
  /** File extension */
  ext: string;
  /** Whether it's a file */
  isFile: boolean;
  /** Whether it's a directory */
  isDirectory: boolean;
  /** Whether it's a symlink */
  isSymlink: boolean;
  /** File size in bytes */
  size: number;
  /** Creation time */
  birthtime: Date;
  /** Modification time */
  mtime: Date;
  /** Access time */
  atime: Date;
  /** Change time */
  ctime: Date;
  /** File mode/permissions */
  mode: number;
  /** Device ID */
  dev: number;
  /** Inode number */
  ino: number;
  /** User ID of owner */
  uid: number;
  /** Group ID of owner */
  gid: number;
}

/** Walk directory options */
export interface WalkDirOptions {
  /** Whether to include directories */
  directories?: boolean;
  /** Whether to include files */
  files?: boolean;
  /** Max depth to walk */
  maxDepth?: number;
}

/** Find files options */
export interface FindFilesOptions {
  /** Maximum depth to search */
  maxDepth?: number;
  /** Glob patterns to match */
  patterns?: string[];
  /** Ignore patterns */
  ignore?: string[];
}

/** Glob options */
export interface GlobOptions {
  /** Base directory */
  baseDir?: string;
  /** Ignore patterns */
  ignore?: string[];
  /** Maximum results */
  maxResults?: number;
}

/** File hash result */
export interface FileHash {
  /** File path */
  path: string;
  /** Algorithm used */
  algorithm: string;
  /** Hash value */
  hash: string;
}

/** Temporary file/directory options */
export interface TempOptions {
  /** Prefix for the temp name */
  prefix?: string;
  /** Suffix for the temp name */
  suffix?: string;
  /** Directory to create temp in */
  dir?: string;
}

/** Symlink type */
export type SymlinkType = 'file' | 'dir' | 'junction';

// ============================================================================
// File Reading
// ============================================================================

/**
 * Read a file asynchronously
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: utf8)
 * @returns Promise resolving to file contents
 */
export async function readFile(filePath: string, encoding: FileEncoding = 'utf8'): Promise<string> {
  return fs.promises.readFile(filePath, encoding);
}

/**
 * Read a file synchronously
 * @param filePath - Path to the file
 * @param encoding - File encoding (default: utf8)
 * @returns File contents
 */
export function readFileSync(filePath: string, encoding: FileEncoding = 'utf8'): string {
  return fs.readFileSync(filePath, encoding);
}

/**
 * Read a file as buffer
 * @param filePath - Path to the file
 * @returns Promise resolving to buffer
 */
export async function readBuffer(filePath: string): Promise<Buffer> {
  return fs.promises.readFile(filePath);
}

/**
 * Read a JSON file
 * @param filePath - Path to the JSON file
 * @returns Promise resolving to parsed JSON
 */
export async function readJson<T = unknown>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf8');
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error('Failed to parse JSON file: ' + filePath + '. Error: ' + (error as Error).message);
  }
}

/**
 * Read a JSON file synchronously
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON
 */
export function readJsonSync<T = unknown>(filePath: string): T {
  const content = readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error('Failed to parse JSON file: ' + filePath + '. Error: ' + (error as Error).message);
  }
}

/**
 * Read a YAML file (basic parser)
 * @param filePath - Path to the YAML file
 * @returns Promise resolving to parsed YAML object
 */
export async function readYaml(filePath: string): Promise<Record<string, unknown>> {
  const content = await readFile(filePath, 'utf8');
  return parseYaml(content);
}

/**
 * Read a YAML file synchronously (basic parser)
 * @param filePath - Path to the YAML file
 * @returns Parsed YAML object
 */
export function readYamlSync(filePath: string): Record<string, unknown> {
  const content = readFileSync(filePath, 'utf8');
  return parseYaml(content);
}

/**
 * Basic YAML parser
 */
function parseYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split('\n');
  const stack: { indent: number; obj: Record<string, unknown> }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const indent = line.search(/\S/);
    const isListItem = trimmedLine.startsWith('- ');

    while (stack.length > 0 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    if (isListItem) {
      const value = trimmedLine.substring(2).trim();
      if (value.includes(':')) {
        const obj: Record<string, unknown> = {};
        const list = (stack[stack.length - 1]?.obj[''] || []) as unknown[];
        list.push(obj);
        stack.push({ indent, obj });
      } else {
        const list = (stack[stack.length - 1]?.obj[''] || []) as unknown[];
        list.push(parseYamlValue(value));
      }
    } else if (trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (value === '') {
        const obj: Record<string, unknown> = {};
        result[key] = obj;
        stack.push({ indent, obj: obj });
      } else {
        result[key] = parseYamlValue(value);
      }
    }
  }

  return result;
}

/**
 * Parse a YAML value
 */
function parseYamlValue(value: string): unknown {
  const cleanValue = value.replace(/#.*$/, '').trim();

  if (cleanValue === 'true') return true;
  if (cleanValue === 'false') return false;
  if (cleanValue === 'null' || cleanValue === '~') return null;

  if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
    return parseFloat(cleanValue);
  }

  if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
    (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
    return cleanValue.slice(1, -1);
  }

  return cleanValue;
}

/**
 * Read a CSV file
 * @param filePath - Path to the CSV file
 * @param options - CSV read options
 * @returns Promise resolving to array of objects or arrays
 */
export async function readCsv(
  filePath: string,
  options: CsvOptions = {}
): Promise<Record<string, string>[] | string[][]> {
  const content = await readFile(filePath, options.encoding || 'utf8');
  return parseCsv(content, options);
}

/**
 * Read a CSV file synchronously
 * @param filePath - Path to the CSV file
 * @param options - CSV read options
 * @returns Array of objects or arrays
 */
export function readCsvSync(
  filePath: string,
  options: CsvOptions = {}
): Record<string, string>[] | string[][] {
  const content = readFileSync(filePath, options.encoding || 'utf8');
  return parseCsv(content, options);
}

/**
 * Parse CSV content
 */
function parseCsv(
  content: string,
  options: CsvOptions
): Record<string, string>[] | string[][] {
  const delimiter = options.delimiter || ',';
  const quote = options.quote || '"';
  const trim = options.trim || false;
  const hasHeader = options.header !== false;
  const columns = options.columns;

  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  const result: (Record<string, string> | string[])[] = [];
  const headers = columns || (hasHeader ? parseCsvLine(lines[0], delimiter, quote, trim) : []);

  for (let i = hasHeader ? 1 : 0; i < lines.length; i++) {
    const values = parseCsvLine(lines[i], delimiter, quote, trim);

    if (hasHeader && headers.length > 0) {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header as string] = values[index] || '';
      });
      result.push(obj);
    } else {
      result.push(values);
    }
  }

  return result as Record<string, string>[] | string[][];
}

/**
 * Parse a single CSV line
 */
function parseCsvLine(line: string, delimiter: string, quote: string, trim: boolean): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === quote) {
        if (line[i + 1] === quote) {
          current += quote;
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === quote) {
        inQuotes = true;
      } else if (char === delimiter) {
        result.push(trim ? current.trim() : current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(trim ? current.trim() : current);
  return result;
}

/**
 * Read a file line by line
 * @param filePath - Path to the file
 * @returns Async iterable for lines
 */
export async function* readLines(
  filePath: string,
  options: { encoding?: FileEncoding } = {}
): AsyncGenerator<string, void, unknown> {
  const encoding = options.encoding || 'utf8';
  const stream = fs.createReadStream(filePath, { encoding });
  let buffer = '';

  for await (const chunk of stream) {
    buffer += chunk;
    let newlineIndex: number;

    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.substring(0, newlineIndex);
      buffer = buffer.substring(newlineIndex + 1);

      if (buffer.includes('\r')) {
        buffer = buffer.replace(/^\r/, '');
      }

      yield line;
    }
  }

  if (buffer) {
    yield buffer;
  }
}

/**
 * Read from stdin
 * @returns Promise resolving to stdin content
 */
export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    const stdin = process.stdin as Readable;

    stdin.setEncoding('utf8');
    stdin.on('data', (chunk) => data += chunk);
    stdin.on('end', () => resolve(data));
    stdin.on('error', reject);
    stdin.resume();
  });
}

// ============================================================================
// File Writing
// ============================================================================

/**
 * Write to a file asynchronously
 * @param filePath - Path to the file
 * @param data - Data to write
 * @param encoding - File encoding (default: utf8)
 * @returns Promise resolving when done
 */
export async function writeFile(
  filePath: string,
  data: string | Buffer,
  encoding: FileEncoding = 'utf8'
): Promise<void> {
  await fs.promises.writeFile(filePath, data, encoding);
}

/**
 * Write to a file synchronously
 * @param filePath - Path to the file
 * @param data - Data to write
 * @param encoding - File encoding (default: utf8)
 */
export function writeFileSync(
  filePath: string,
  data: string | Buffer,
  encoding: FileEncoding = 'utf8'
): void {
  fs.writeFileSync(filePath, data, encoding);
}

/**
 * Write a JSON file
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 * @param options - JSON write options
 * @returns Promise resolving when done
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  options: JsonFileOptions = {}
): Promise<void> {
  const space = options.space ?? 2;
  const eol = options.eol ?? '\n';
  const jsonString = JSON.stringify(data, null, space) + eol;
  await writeFile(filePath, jsonString, 'utf8');
}

/**
 * Write a JSON file synchronously
 * @param filePath - Path to the JSON file
 * @param data - Data to write
 * @param options - JSON write options
 */
export function writeJsonSync(
  filePath: string,
  data: unknown,
  options: JsonFileOptions = {}
): void {
  const space = options.space ?? 2;
  const eol = options.eol ?? '\n';
  const jsonString = JSON.stringify(data, null, space) + eol;
  writeFileSync(filePath, jsonString, 'utf8');
}

/**
 * Write a YAML file
 * @param filePath - Path to the YAML file
 * @param data - Data to write
 * @param options - YAML write options
 * @returns Promise resolving when done
 */
export async function writeYaml(
  filePath: string,
  data: unknown,
  options: YamlOptions = {}
): Promise<void> {
  const yamlContent = stringifyYaml(data, options);
  await writeFile(filePath, yamlContent, 'utf8');
}

/**
 * Write a YAML file synchronously
 * @param filePath - Path to the YAML file
 * @param data - Data to write
 * @param options - YAML write options
 */
export function writeYamlSync(
  filePath: string,
  data: unknown,
  options: YamlOptions = {}
): void {
  const yamlContent = stringifyYaml(data, options);
  writeFileSync(filePath, yamlContent, 'utf8');
}

/**
 * Stringify an object to YAML
 */
function stringifyYaml(data: unknown, options: YamlOptions = {}): string {
  const indent = options.indent ?? 2;
  return stringifyYamlValue(data, 0, indent, options);
}

/**
 * Stringify a YAML value
 */
function stringifyYamlValue(
  value: unknown,
  currentIndent: number,
  indent: number,
  options: YamlOptions
): string {
  const indents = ' '.repeat(currentIndent * indent);

  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'string') {
    if (value.includes(':') || value.includes('#') || value.includes('\n') ||
      value.startsWith('- ') || value === 'true' || value === 'false' || value === 'null' ||
      /^\d/.test(value)) {
      if (options.singleQuote) {
        return "'" + value.replace(/'/g, "''") + "'";
      }
      return '"' + value.replace(/"/g, '\\"') + '"';
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map((item) => {
      const itemStr = stringifyYamlValue(item, currentIndent, indent, options);
      if (itemStr.includes('\n')) {
        return indents + '-\n' + stringifyYamlValue(item, currentIndent + 1, indent, options);
      }
      return indents + '- ' + itemStr;
    }).join('\n');
  }

  if (typeof value === 'object') {
    const keys = options.sortKeys ? Object.keys(value).sort() : Object.keys(value);
    if (keys.length === 0) return '{}';

    const lines: string[] = [];
    for (const key of keys) {
      const keyStr = options.singleQuote ? "'" + key + "'" : key;
      const val = (value as Record<string, unknown>)[key];
      const valStr = stringifyYamlValue(val, currentIndent + 1, indent, options);

      if (valStr.includes('\n')) {
        lines.push(indents + keyStr + ':');
        lines.push(valStr);
      } else {
        lines.push(indents + keyStr + ': ' + valStr);
      }
    }

    return lines.join('\n');
  }

  return String(value);
}

/**
 * Write a CSV file
 * @param filePath - Path to the CSV file
 * @param data - Data to write
 * @param options - CSV write options
 * @returns Promise resolving when done
 */
export async function writeCsv(
  filePath: string,
  data: Record<string, unknown>[] | string[][],
  options: CsvOptions = {}
): Promise<void> {
  const csvContent = stringifyCsv(data, options);
  await writeFile(filePath, csvContent, options.encoding || 'utf8');
}

/**
 * Write a CSV file synchronously
 * @param filePath - Path to the CSV file
 * @param data - Data to write
 * @param options - CSV write options
 */
export function writeCsvSync(
  filePath: string,
  data: Record<string, unknown>[] | string[][],
  options: CsvOptions = {}
): void {
  const csvContent = stringifyCsv(data, options);
  writeFileSync(filePath, csvContent, options.encoding || 'utf8');
}

/**
 * Stringify data to CSV
 */
function stringifyCsv(
  data: Record<string, unknown>[] | string[][],
  options: CsvOptions
): string {
  const delimiter = options.delimiter || ',';
  const quote = options.quote || '"';
  const hasHeader = options.header !== false;
  const columns = options.columns;

  if (data.length === 0) return '';

  const rows: string[][] = [];

  if (hasHeader && columns) {
    rows.push(columns);
  } else if (hasHeader && data.length > 0 && !Array.isArray(data[0])) {
    rows.push(Object.keys(data[0] as Record<string, unknown>));
  }

  for (const row of data) {
    if (Array.isArray(row)) {
      rows.push(row.map(cell => stringifyCsvValue(cell, delimiter, quote)));
    } else {
      const values = columns
        ? columns.map(col => (row as Record<string, unknown>)[col] as string)
        : Object.values(row as Record<string, unknown>).map(val => String(val));
      rows.push(values.map(cell => stringifyCsvValue(cell, delimiter, quote)));
    }
  }

  return rows.map(row => row.join(delimiter)).join('\n');
}

/**
 * Stringify a CSV value
 */
function stringifyCsvValue(value: unknown, delimiter: string, quote: string): string {
  const str = String(value);

  if (str.includes(delimiter) || str.includes(quote) || str.includes('\n') || str.includes('\r')) {
    return quote + str.replace(new RegExp(quote, 'g'), quote + quote) + quote;
  }

  return str;
}

/**
 * Append to a file asynchronously
 * @param filePath - Path to the file
 * @param data - Data to append
 * @param encoding - File encoding (default: utf8)
 * @returns Promise resolving when done
 */
export async function appendFile(
  filePath: string,
  data: string | Buffer,
  encoding: FileEncoding = 'utf8'
): Promise<void> {
  await fs.promises.appendFile(filePath, data, encoding);
}

/**
 * Append to a file synchronously
 * @param filePath - Path to the file
 * @param data - Data to append
 * @param encoding - File encoding (default: utf8)
 */
export function appendFileSync(
  filePath: string,
  data: string | Buffer,
  encoding: FileEncoding = 'utf8'
): void {
  fs.appendFileSync(filePath, data, encoding);
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * Copy a file asynchronously
 * @param src - Source file path
 * @param dest - Destination file path
 * @returns Promise resolving when done
 */
export async function copyFile(src: string, dest: string): Promise<void> {
  await fs.promises.copyFile(src, dest);
}

/**
 * Copy a file synchronously
 * @param src - Source file path
 * @param dest - Destination file path
 */
export function copyFileSync(src: string, dest: string): void {
  fs.copyFileSync(src, dest);
}

/**
 * Move/rename a file asynchronously
 * @param src - Source file path
 * @param dest - Destination file path
 * @returns Promise resolving when done
 */
export async function moveFile(src: string, dest: string): Promise<void> {
  await fs.promises.rename(src, dest);
}

/**
 * Move/rename a file synchronously
 * @param src - Source file path
 * @param dest - Destination file path
 */
export function moveFileSync(src: string, dest: string): void {
  fs.renameSync(src, dest);
}

/**
 * Delete a file asynchronously
 * @param filePath - Path to the file
 * @returns Promise resolving when done
 */
export async function deleteFile(filePath: string): Promise<void> {
  await fs.promises.unlink(filePath);
}

/**
 * Delete a file synchronously
 * @param filePath - Path to the file
 */
export function deleteFileSync(filePath: string): void {
  fs.unlinkSync(filePath);
}

/**
 * Truncate a file asynchronously
 * @param filePath - Path to the file
 * @param length - Length to truncate to (0 to empty file)
 * @returns Promise resolving when done
 */
export async function truncateFile(filePath: string, length: number = 0): Promise<void> {
  const handle = await fs.promises.open(filePath, 'r+');
  await handle.truncate(length);
  await handle.close();
}

/**
 * Truncate a file synchronously
 * @param filePath - Path to the file
 * @param length - Length to truncate to
 */
export function truncateFileSync(filePath: string, length: number = 0): void {
  const handle = fs.openSync(filePath, 'r+');
  fs.ftruncateSync(handle, length);
  fs.closeSync(handle);
}

// ============================================================================
// Directory Operations
// ============================================================================

/**
 * Create a directory asynchronously
 * @param dirPath - Path to the directory
 * @param options - Directory options
 * @returns Promise resolving to directory path
 */
export async function createDir(
  dirPath: string,
  options?: { mode?: number; recursive?: boolean }
): Promise<string> {
  await fs.promises.mkdir(dirPath, options);
  return dirPath;
}

/**
 * Create a directory synchronously
 * @param dirPath - Path to the directory
 * @param options - Directory options
 * @returns Directory path
 */
export function createDirSync(
  dirPath: string,
  options?: { mode?: number; recursive?: boolean }
): string {
  fs.mkdirSync(dirPath, options);
  return dirPath;
}

/**
 * Create a directory recursively asynchronously
 * @param dirPath - Path to the directory
 * @returns Promise resolving to directory path
 */
export async function createDirAll(dirPath: string): Promise<string> {
  await fs.promises.mkdir(dirPath, { recursive: true });
  return dirPath;
}

/**
 * Create a directory recursively synchronously
 * @param dirPath - Path to the directory
 * @returns Directory path
 */
export function createDirAllSync(dirPath: string): string {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

/**
 * Read a directory asynchronously
 * @param dirPath - Path to the directory
 * @returns Promise resolving to directory entries
 */
export async function readDir(dirPath: string): Promise<string[]> {
  return fs.promises.readdir(dirPath);
}

/**
 * Read a directory synchronously
 * @param dirPath - Path to the directory
 * @returns Directory entries
 */
export function readDirSync(dirPath: string): string[] {
  return fs.readdirSync(dirPath);
}

/**
 * Read a directory recursively asynchronously
 * @param dirPath - Path to the directory
 * @returns Promise resolving to array of file paths
 */
export async function readDirRecursive(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentPath: string, depth: number = 0): Promise<void> {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      results.push(fullPath);

      if (entry.isDirectory()) {
        await walk(fullPath, depth + 1);
      }
    }
  }

  await walk(dirPath);
  return results;
}

/**
 * Read a directory recursively synchronously
 * @param dirPath - Path to the directory
 * @returns Array of file paths
 */
export function readDirRecursiveSync(dirPath: string): string[] {
  const results: string[] = [];

  function walk(currentPath: string, depth: number = 0): void {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      results.push(fullPath);

      if (entry.isDirectory()) {
        walk(fullPath, depth + 1);
      }
    }
  }

  walk(dirPath);
  return results;
}

/**
 * Walk directory tree asynchronously
 * @param dirPath - Path to the directory
 * @param options - Walk options
 * @returns Async iterable for file info
 */
export async function* walkDir(
  dirPath: string,
  options: WalkDirOptions = {}
): AsyncGenerator<FileInfo, void, unknown> {
  const maxDepth = options.maxDepth ?? Infinity;

  async function* walk(
    currentPath: string,
    depth: number = 0
  ): AsyncGenerator<FileInfo, void, unknown> {
    if (depth > maxDepth) return;

    let entries: fs.Dirent[];

    try {
      entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      try {
        const stat = await fs.promises.lstat(fullPath);
        const fileInfo = createFileInfo(fullPath, stat);

        if (fileInfo.isDirectory && options.directories !== false) {
          yield fileInfo;
        } else if (fileInfo.isFile && options.files !== false) {
          yield fileInfo;
        }

        if (fileInfo.isDirectory) {
          yield* walk(fullPath, depth + 1);
        }
      } catch {
        continue;
      }
    }
  }

  yield* walk(dirPath);
}

/**
 * Walk directory tree synchronously
 * @param dirPath - Path to the directory
 * @param options - Walk options
 * @returns Array of file info
 */
export function walkDirSync(
  dirPath: string,
  options: WalkDirOptions = {}
): FileInfo[] {
  const results: FileInfo[] = [];
  const maxDepth = options.maxDepth ?? Infinity;

  function walk(currentPath: string, depth: number = 0): void {
    if (depth > maxDepth) return;

    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      try {
        const stat = fs.lstatSync(fullPath);
        const fileInfo = createFileInfo(fullPath, stat);

        if (fileInfo.isDirectory && options.directories !== false) {
          results.push(fileInfo);
        } else if (fileInfo.isFile && options.files !== false) {
          results.push(fileInfo);
        }

        if (fileInfo.isDirectory) {
          walk(fullPath, depth + 1);
        }
      } catch {
        continue;
      }
    }
  }

  walk(dirPath);
  return results;
}

/**
 * Delete a directory asynchronously
 * @param dirPath - Path to the directory
 * @returns Promise resolving when done
 */
export async function deleteDir(dirPath: string): Promise<void> {
  await fs.promises.rmdir(dirPath);
}

/**
 * Delete a directory synchronously
 * @param dirPath - Path to the directory
 */
export function deleteDirSync(dirPath: string): void {
  fs.rmdirSync(dirPath);
}

/**
 * Delete a directory recursively asynchronously
 * @param dirPath - Path to the directory
 * @returns Promise resolving when done
 */
export async function deleteDirAll(dirPath: string): Promise<void> {
  await fs.promises.rm(dirPath, { recursive: true, force: true });
}

/**
 * Delete a directory recursively synchronously
 * @param dirPath - Path to the directory
 */
export function deleteDirAllSync(dirPath: string): void {
  fs.rmSync(dirPath, { recursive: true, force: true });
}

/**
 * Copy a directory asynchronously
 * @param src - Source directory path
 * @param dest - Destination directory path
 * @returns Promise resolving when done
 */
export async function copyDir(src: string, dest: string): Promise<void> {
  const srcStat = await fs.promises.stat(src);
  if (!srcStat.isDirectory()) {
    throw new Error('Source is not a directory: ' + src);
  }

  await createDirAll(dest);

  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      if (entry.isSymbolicLink()) {
        const target = await fs.promises.readlink(srcPath);
        await fs.promises.symlink(target, destPath, entry.isDirectory() ? 'dir' : 'file');
      } else {
        await copyFile(srcPath, destPath);
      }
    }
  }
}

/**
 * Copy a directory synchronously
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
export function copyDirSync(src: string, dest: string): void {
  const srcStat = fs.statSync(src);
  if (!srcStat.isDirectory()) {
    throw new Error('Source is not a directory: ' + src);
  }

  createDirAllSync(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      if (entry.isSymbolicLink()) {
        const target = fs.readlinkSync(srcPath);
        fs.symlinkSync(target, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

/**
 * Move a directory asynchronously
 * @param src - Source directory path
 * @param dest - Destination directory path
 * @returns Promise resolving when done
 */
export async function moveDir(src: string, dest: string): Promise<void> {
  await fs.promises.rename(src, dest);
}

/**
 * Move a directory synchronously
 * @param src - Source directory path
 * @param dest - Destination directory path
 */
export function moveDirSync(src: string, dest: string): void {
  fs.renameSync(src, dest);
}

// ============================================================================
// Path Operations
// ============================================================================

/**
 * Check if a path exists asynchronously
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function exists(pathToCheck: string): Promise<boolean> {
  try {
    await fs.promises.access(pathToCheck, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path exists synchronously
 * @param pathToCheck - Path to check
 * @returns Boolean indicating if path exists
 */
export function existsSync(pathToCheck: string): boolean {
  return fs.existsSync(pathToCheck);
}

/**
 * Check if a path is a file
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isFile(pathToCheck: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(pathToCheck);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Check if a path is a directory
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isDirectory(pathToCheck: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(pathToCheck);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a path is a symlink
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isSymlink(pathToCheck: string): Promise<boolean> {
  try {
    const stat = await fs.promises.lstat(pathToCheck);
    return stat.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Check if a path is executable
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isExecutable(pathToCheck: string): Promise<boolean> {
  try {
    await fs.promises.access(pathToCheck, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is readable
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isReadable(pathToCheck: string): Promise<boolean> {
  try {
    await fs.promises.access(pathToCheck, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path is writable
 * @param pathToCheck - Path to check
 * @returns Promise resolving to boolean
 */
export async function isWritable(pathToCheck: string): Promise<boolean> {
  try {
    await fs.promises.access(pathToCheck, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// File Information
// ============================================================================

/**
 * Get file information
 * @param filePath - Path to the file
 * @returns Promise resolving to file info
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stat = await fs.promises.stat(filePath);
  return createFileInfo(filePath, stat);
}

/**
 * Get file information synchronously
 * @param filePath - Path to the file
 * @returns File info
 */
export function getFileInfoSync(filePath: string): FileInfo {
  const stat = fs.statSync(filePath);
  return createFileInfo(filePath, stat);
}

/**
 * Create file info object
 */
function createFileInfo(filePath: string, stat: fs.Stats): FileInfo {
  return {
    path: filePath,
    name: path.basename(filePath),
    ext: path.extname(filePath),
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
    isSymlink: stat.isSymbolicLink(),
    size: stat.size,
    birthtime: stat.birthtime,
    mtime: stat.mtime,
    atime: stat.atime,
    ctime: stat.ctime,
    mode: stat.mode,
    dev: stat.dev,
    ino: stat.ino,
    uid: stat.uid,
    gid: stat.gid
  };
}

/**
 * Get file stats
 * @param filePath - Path to the file
 * @returns Promise resolving to fs.Stats
 */
export async function getFileStats(filePath: string): Promise<fs.Stats> {
  return fs.promises.stat(filePath);
}

/**
 * Get file stats synchronously
 * @param filePath - Path to the file
 * @returns fs.Stats
 */
export function getFileStatsSync(filePath: string): fs.Stats {
  return fs.statSync(filePath);
}

/**
 * Get file size
 * @param filePath - Path to the file
 * @returns Promise resolving to file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.promises.stat(filePath);
  return stat.size;
}

/**
 * Get file size synchronously
 * @param filePath - Path to the file
 * @returns File size in bytes
 */
export function getFileSizeSync(filePath: string): number {
  const stat = fs.statSync(filePath);
  return stat.size;
}

/**
 * Get file mode/permissions
 * @param filePath - Path to the file
 * @returns Promise resolving to file mode
 */
export async function getFileMode(filePath: string): Promise<number> {
  const stat = await fs.promises.stat(filePath);
  return stat.mode;
}

/**
 * Get file mode/permissions synchronously
 * @param filePath - Path to the file
 * @returns File mode
 */
export function getFileModeSync(filePath: string): number {
  const stat = fs.statSync(filePath);
  return stat.mode;
}

/**
 * Get file modification time
 * @param filePath - Path to the file
 * @returns Promise resolving to modification time
 */
export async function getFileMtime(filePath: string): Promise<Date> {
  const stat = await fs.promises.stat(filePath);
  return stat.mtime;
}

/**
 * Get file modification time synchronously
 * @param filePath - Path to the file
 * @returns Modification time
 */
export function getFileMtimeSync(filePath: string): Date {
  const stat = fs.statSync(filePath);
  return stat.mtime;
}

/**
 * Get file access time
 * @param filePath - Path to the file
 * @returns Promise resolving to access time
 */
export async function getFileAtime(filePath: string): Promise<Date> {
  const stat = await fs.promises.stat(filePath);
  return stat.atime;
}

/**
 * Get file access time synchronously
 * @param filePath - Path to the file
 * @returns Access time
 */
export function getFileAtimeSync(filePath: string): Date {
  const stat = fs.statSync(filePath);
  return stat.atime;
}

/**
 * Get file change time
 * @param filePath - Path to the file
 * @returns Promise resolving to change time
 */
export async function getFileCtime(filePath: string): Promise<Date> {
  const stat = await fs.promises.stat(filePath);
  return stat.ctime;
}

/**
 * Get file change time synchronously
 * @param filePath - Path to the file
 * @returns Change time
 */
export function getFileCtimeSync(filePath: string): Date {
  const stat = fs.statSync(filePath);
  return stat.ctime;
}

/**
 * Get file birth time
 * @param filePath - Path to the file
 * @returns Promise resolving to birth time
 */
export async function getFileBirthtime(filePath: string): Promise<Date> {
  const stat = await fs.promises.stat(filePath);
  return stat.birthtime;
}

/**
 * Get file birth time synchronously
 * @param filePath - Path to the file
 * @returns Birth time
 */
export function getFileBirthtimeSync(filePath: string): Date {
  const stat = fs.statSync(filePath);
  return stat.birthtime;
}

/**
 * Get file hash
 * @param filePath - Path to the file
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Promise resolving to file hash
 */
export async function getFileHash(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<FileHash> {
  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => {
      resolve({
        path: filePath,
        algorithm,
        hash: hash.digest('hex')
      });
    });
    stream.on('error', reject);
  });
}

/**
 * Get file hash synchronously
 * @param filePath - Path to the file
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns File hash
 */
export function getFileHashSync(
  filePath: string,
  algorithm: string = 'sha256'
): FileHash {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash(algorithm);
  hash.update(content);

  return {
    path: filePath,
    algorithm,
    hash: hash.digest('hex')
  };
}

/**
 * Get file checksum
 * @param filePath - Path to the file
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Promise resolving to checksum
 */
export async function getFileChecksum(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<string> {
  const hash = await getFileHash(filePath, algorithm);
  return hash.hash;
}

/**
 * Get file checksum synchronously
 * @param filePath - Path to the file
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Checksum
 */
export function getFileChecksumSync(
  filePath: string,
  algorithm: string = 'sha256'
): string {
  const hash = getFileHashSync(filePath, algorithm);
  return hash.hash;
}

// ============================================================================
// File Modification
// ============================================================================

/**
 * Set file mode
 * @param filePath - Path to the file
 * @param mode - Mode to set
 * @returns Promise resolving when done
 */
export async function setFileMode(filePath: string, mode: number): Promise<void> {
  await fs.promises.chmod(filePath, mode);
}

/**
 * Set file mode synchronously
 * @param filePath - Path to the file
 * @param mode - Mode to set
 */
export function setFileModeSync(filePath: string, mode: number): void {
  fs.chmodSync(filePath, mode);
}

/**
 * Set file modification time
 * @param filePath - Path to the file
 * @param mtime - Modification time to set
 * @returns Promise resolving when done
 */
export async function setFileMtime(filePath: string, mtime: Date): Promise<void> {
  await fs.promises.utimes(filePath, mtime, mtime);
}

/**
 * Set file modification time synchronously
 * @param filePath - Path to the file
 * @param mtime - Modification time to set
 */
export function setFileMtimeSync(filePath: string, mtime: Date): void {
  fs.utimesSync(filePath, mtime, mtime);
}

/**
 * Set file access time
 * @param filePath - Path to the file
 * @param atime - Access time to set
 * @returns Promise resolving when done
 */
export async function setFileAtime(filePath: string, atime: Date): Promise<void> {
  const mtime = await getFileMtime(filePath);
  await fs.promises.utimes(filePath, atime, mtime);
}

/**
 * Set file access time synchronously
 * @param filePath - Path to the file
 * @param atime - Access time to set
 */
export function setFileAtimeSync(filePath: string, atime: Date): void {
  const mtime = getFileMtimeSync(filePath);
  fs.utimesSync(filePath, atime, mtime);
}

/**
 * Update file timestamp (touch)
 * @param filePath - Path to the file
 * @returns Promise resolving when done
 */
export async function touch(filePath: string): Promise<void> {
  const now = new Date();
  await setFileMtime(filePath, now);
}

/**
 * Update file timestamp synchronously (touch)
 * @param filePath - Path to the file
 */
export function touchSync(filePath: string): void {
  const now = new Date();
  setFileMtimeSync(filePath, now);
}

/**
 * Change file mode (chmod)
 * @param filePath - Path to the file
 * @param mode - Mode to set
 * @returns Promise resolving when done
 */
export async function chmod(filePath: string, mode: number): Promise<void> {
  await fs.promises.chmod(filePath, mode);
}

/**
 * Change file mode synchronously (chmod)
 * @param filePath - Path to the file
 * @param mode - Mode to set
 */
export function chmodSync(filePath: string, mode: number): void {
  fs.chmodSync(filePath, mode);
}

/**
 * Change file owner (chown)
 * @param filePath - Path to the file
 * @param uid - User ID
 * @param gid - Group ID
 * @returns Promise resolving when done
 */
export async function chown(
  filePath: string,
  uid: number,
  gid: number
): Promise<void> {
  await fs.promises.chown(filePath, uid, gid);
}

/**
 * Change file owner synchronously (chown)
 * @param filePath - Path to the file
 * @param uid - User ID
 * @param gid - Group ID
 */
export function chownSync(
  filePath: string,
  uid: number,
  gid: number
): void {
  fs.chownSync(filePath, uid, gid);
}

/**
 * Rename a file
 * @param filePath - Current path
 * @param newPath - New path
 * @returns Promise resolving when done
 */
export async function rename(filePath: string, newPath: string): Promise<void> {
  await fs.promises.rename(filePath, newPath);
}

/**
 * Rename a file synchronously
 * @param filePath - Current path
 * @param newPath - New path
 */
export function renameSync(filePath: string, newPath: string): void {
  fs.renameSync(filePath, newPath);
}

// ============================================================================
// Symlink Operations
// ============================================================================

/**
 * Create a symlink
 * @param target - Target path
 * @param linkPath - Symlink path
 * @param type - Symlink type
 * @returns Promise resolving when done
 */
export async function createSymlink(
  target: string,
  linkPath: string,
  type: SymlinkType = 'file'
): Promise<void> {
  await fs.promises.symlink(target, linkPath, type);
}

/**
 * Create a symlink synchronously
 * @param target - Target path
 * @param linkPath - Symlink path
 * @param type - Symlink type
 */
export function createSymlinkSync(
  target: string,
  linkPath: string,
  type: SymlinkType = 'file'
): void {
  fs.symlinkSync(target, linkPath, type);
}

/**
 * Read a symlink target
 * @param linkPath - Path to the symlink
 * @returns Promise resolving to target path
 */
export async function readSymlink(linkPath: string): Promise<string> {
  return fs.promises.readlink(linkPath);
}

/**
 * Read a symlink target synchronously
 * @param linkPath - Path to the symlink
 * @returns Target path
 */
export function readSymlinkSync(linkPath: string): string {
  return fs.readlinkSync(linkPath);
}

// ============================================================================
// Temporary Files/Directories
// ============================================================================

/**
 * Get the temp directory
 * @returns Path to temp directory
 */
export function getTempDir(): string {
  return require('os').tmpdir();
}

/**
 * Create a temporary directory
 * @param options - Temp directory options
 * @returns Promise resolving to temp directory path
 */
export async function createTempDir(options: TempOptions = {}): Promise<string> {
  const tempDir = getTempDir();
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';
  const dir = options.dir || tempDir;

  const tempPath = path.join(dir, prefix + crypto.randomBytes(8).toString('hex') + suffix);
  await createDirAll(tempPath);

  return tempPath;
}

/**
 * Create a temporary file
 * @param options - Temp file options
 * @returns Promise resolving to temp file path
 */
export async function createTempFile(options: TempOptions = {}): Promise<string> {
  const tempDir = getTempDir();
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';
  const dir = options.dir || tempDir;

  const tempPath = path.join(dir, prefix + crypto.randomBytes(8).toString('hex') + suffix + '.tmp');

  await writeFile(tempPath, '', 'utf8');

  return tempPath;
}

/**
 * Clean the temp directory
 * @param maxAge - Maximum age in milliseconds (default: 24 hours)
 * @returns Promise resolving when done
 */
export async function cleanTempDir(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
  const tempDir = getTempDir();
  const now = Date.now();

  try {
    const entries = await fs.promises.readdir(tempDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(tempDir, entry.name);

      try {
        const stat = await fs.promises.lstat(fullPath);

        if (now - stat.mtimeMs > maxAge) {
          if (entry.isDirectory()) {
            await deleteDirAll(fullPath);
          } else {
            await deleteFile(fullPath);
          }
        }
      } catch {
        // Ignore errors for individual entries
      }
    }
  } catch {
    // Ignore errors
  }
}

// ============================================================================
// Search & Find
// ============================================================================

/**
 * Find files matching a pattern asynchronously
 * @param pattern - Glob pattern or file path
 * @param options - Find options
 * @returns Promise resolving to array of file paths
 */
export async function findFiles(
  pattern: string,
  options: FindFilesOptions = {}
): Promise<string[]> {
  if (pattern.includes('*') || pattern.includes('?')) {
    return glob(pattern, options);
  }

  if (await exists(pattern)) {
    return [pattern];
  }

  return [];
}

/**
 * Find files matching a pattern synchronously
 * @param pattern - Glob pattern or file path
 * @param options - Find options
 * @returns Array of file paths
 */
export function findFilesSync(
  pattern: string,
  options: FindFilesOptions = {}
): string[] {
  if (pattern.includes('*') || pattern.includes('?')) {
    return globSync(pattern, options);
  }

  if (existsSync(pattern)) {
    return [pattern];
  }

  return [];
}

/**
 * Match files using glob patterns asynchronously
 * @param pattern - Glob pattern
 * @param options - Glob options
 * @returns Promise resolving to array of matching file paths
 */
export async function glob(
  pattern: string,
  options: GlobOptions = {}
): Promise<string[]> {
  const baseDir = options.baseDir || '.';
  const results: string[] = [];

  const parts = pattern.split('/');
  const regexPattern = parts.map(part => {
    if (part === '**') {
      return '.*';
    }
    if (part.includes('*') || part.includes('?')) {
      return part
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    }
    return part.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }).join('/');

  const regex = new RegExp('^' + regexPattern + '$');

  async function scan(dir: string, depth: number = 0): Promise<void> {
    const maxDepth = 20;

    if (depth > maxDepth) return;

    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (options.ignore && shouldIgnore(relativePath, options.ignore)) {
          continue;
        }

        if (regex.test(relativePath) || regex.test(entry.name)) {
          if (entry.isFile()) {
            results.push(fullPath);
            if (options.maxResults && results.length >= options.maxResults) {
              return;
            }
          }
        }

        if (entry.isDirectory() && !options.ignore?.some(ig => relativePath.includes(ig))) {
          await scan(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  await scan(baseDir);

  return results.map(r => path.relative(baseDir, r));
}

/**
 * Match files using glob patterns synchronously
 * @param pattern - Glob pattern
 * @param options - Glob options
 * @returns Array of matching file paths
 */
export function globSync(
  pattern: string,
  options: GlobOptions = {}
): string[] {
  const baseDir = options.baseDir || '.';
  const results: string[] = [];

  const parts = pattern.split('/');
  const regexPattern = parts.map(part => {
    if (part === '**') {
      return '.*';
    }
    if (part.includes('*') || part.includes('?')) {
      return part
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
    }
    return part.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }).join('/');

  const regex = new RegExp('^' + regexPattern + '$');

  function scan(dir: string, depth: number = 0): void {
    const maxDepth = 20;

    if (depth > maxDepth) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (options.ignore && shouldIgnore(relativePath, options.ignore)) {
          continue;
        }

        if (regex.test(relativePath) || regex.test(entry.name)) {
          if (entry.isFile()) {
            results.push(fullPath);
            if (options.maxResults && results.length >= options.maxResults) {
              return;
            }
          }
        }

        if (entry.isDirectory() && !options.ignore?.some(ig => relativePath.includes(ig))) {
          scan(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  scan(baseDir);

  return results.map(r => path.relative(baseDir, r));
}

/**
 * Find a file by searching upwards from start directory
 * @param filename - File name to find
 * @param startDir - Starting directory
 * @returns Promise resolving to file path or null
 */
export async function findUp(
  filename: string,
  startDir: string = process.cwd()
): Promise<string | null> {
  let currentDir = startDir;
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const filePath = path.join(currentDir, filename);

    if (await exists(filePath)) {
      return filePath;
    }

    currentDir = path.dirname(currentDir);
  }

  const rootFile = path.join(rootDir, filename);
  if (await exists(rootFile)) {
    return rootFile;
  }

  return null;
}

/**
 * Find a file by searching upwards from start directory synchronously
 * @param filename - File name to find
 * @param startDir - Starting directory
 * @returns File path or null
 */
export function findUpSync(
  filename: string,
  startDir: string = process.cwd()
): string | null {
  let currentDir = startDir;
  const rootDir = path.parse(currentDir).root;

  while (currentDir !== rootDir) {
    const filePath = path.join(currentDir, filename);

    if (existsSync(filePath)) {
      return filePath;
    }

    currentDir = path.dirname(currentDir);
  }

  const rootFile = path.join(rootDir, filename);
  if (existsSync(rootFile)) {
    return rootFile;
  }

  return null;
}

/**
 * Find a file in a directory and its subdirectories
 * @param filename - File name to find
 * @param dir - Directory to search in
 * @returns Promise resolving to array of file paths
 */
export async function findInDir(
  filename: string,
  dir: string
): Promise<string[]> {
  const results: string[] = [];

  async function search(currentDir: string): Promise<void> {
    try {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.name === filename) {
          results.push(fullPath);
        }

        if (entry.isDirectory()) {
          await search(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  await search(dir);
  return results;
}

/**
 * Find a file in a directory and its subdirectories synchronously
 * @param filename - File name to find
 * @param dir - Directory to search in
 * @returns Array of file paths
 */
export function findInDirSync(
  filename: string,
  dir: string
): string[] {
  const results: string[] = [];

  function search(currentDir: string): void {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.name === filename) {
          results.push(fullPath);
        }

        if (entry.isDirectory()) {
          search(fullPath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  search(dir);
  return results;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Ensure a directory exists
 * @param dirPath - Path to the directory
 * @returns Promise resolving to directory path
 */
export async function ensureDir(dirPath: string): Promise<string> {
  await createDirAll(dirPath);
  return dirPath;
}

/**
 * Ensure a directory exists synchronously
 * @param dirPath - Path to the directory
 * @returns Directory path
 */
export function ensureDirSync(dirPath: string): string {
  createDirAllSync(dirPath);
  return dirPath;
}

/**
 * Empty a directory (delete all contents)
 * @param dirPath - Path to the directory
 * @returns Promise resolving when done
 */
export async function emptyDir(dirPath: string): Promise<void> {
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await deleteDirAll(fullPath);
    } else {
      await deleteFile(fullPath);
    }
  }
}

/**
 * Empty a directory synchronously
 * @param dirPath - Path to the directory
 */
export function emptyDirSync(dirPath: string): void {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      deleteDirAllSync(fullPath);
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Get the relative path between two paths
 * @param from - From path
 * @param to - To path
 * @returns Relative path
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}

/**
 * Get the absolute path
 * @param pathToResolve - Path to resolve
 * @returns Absolute path
 */
export function getAbsolutePath(pathToResolve: string): string {
  return path.resolve(pathToResolve);
}

/**
 * Normalize a path
 * @param pathToNormalize - Path to normalize
 * @returns Normalized path
 */
export function normalizePath(pathToNormalize: string): string {
  return path.normalize(pathToNormalize);
}

/**
 * Resolve path segments
 * @param paths - Path segments to resolve
 * @returns Resolved path
 */
export function resolvePath(...paths: string[]): string {
  return path.resolve(...paths);
}

// ============================================================================
// Watch Functions
// ============================================================================

/**
 * Watch a file for changes
 * @param filePath - Path to the file
 * @param callback - Callback for changes
 * @returns File watcher
 */
export function watchFile(
  filePath: string,
  callback?: (event: string, filename: string | Buffer) => void
): fs.FSWatcher {
  return fs.watch(filePath, callback as fs.WatchListener<string | Buffer>);
}

/**
 * Watch a directory for changes
 * @param dirPath - Path to the directory
 * @param callback - Callback for changes
 * @returns Directory watcher
 */
export function watchDir(
  dirPath: string,
  callback?: (event: string, filename: string | Buffer) => void
): fs.FSWatcher {
  return fs.watch(dirPath, callback as fs.WatchListener<string | Buffer>);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a path should be ignored
 */
function shouldIgnore(pathToCheck: string, ignorePatterns: string[]): boolean {
  return ignorePatterns.some(pattern => {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.')
      .replace(/[.+^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp('^' + regexPattern + '$');
    return regex.test(pathToCheck);
  });
}
