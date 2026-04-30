// Mock chalk before any imports
jest.mock('chalk', () => ({
  blue: jest.fn((text) => text),
  red: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  green: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  magenta: jest.fn((text) => text),
  cyan: jest.fn((text) => text),
  white: jest.fn((text) => text),
  black: jest.fn((text) => text),
  bgBlack: jest.fn((text) => text),
  bgRed: jest.fn((text) => text),
  bgGreen: jest.fn((text) => text),
  bgYellow: jest.fn((text) => text),
  bgBlue: jest.fn((text) => text),
  bgMagenta: jest.fn((text) => text),
  bgCyan: jest.fn((text) => text),
  bgWhite: jest.fn((text) => text),
}));

import {
  sleep,
  retry,
  uuid,
  asyncQueue,
  debounce,
  throttle,
  deepClone,
  pick,
  omit,
  merge,
  isEmpty,
  env,
  bytes,
  hash,
  randomString,
  fromQueryString,
  toQueryString,
  isEmail,
  isUrl,
  randomInt,
  shuffle,
  capitalize,
  truncate
} from './index';

describe('Async Utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should resolve sleep after specified time', async () => {
    const sleepPromise = sleep(100);
    jest.advanceTimersByTime(100);
    await sleepPromise;
  });

  it.skip('should retry failed operations', async () => {
    let attempts = 0;
    const failingFn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('Failed');
      return 'success';
    };

    const result = await retry(failingFn, { 
      times: 3,
      delay: 1,  // Minimal delay
      jitter: false,
      maxDelay: 10
    });
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  }, 30000);

  it('should process asyncQueue with concurrency', async () => {
    const tasks = Array.from({ length: 4 }, (_, i) => async () => i);
    const queueResults = await asyncQueue(tasks, 2);
    expect(queueResults).toHaveLength(4);
    expect([...queueResults].sort()).toEqual([0, 1, 2, 3]);
  });

  it('should debounce function calls', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throttle function calls', () => {
    const fn = jest.fn();
    const throttledFn = throttle(fn, 100);
    throttledFn();
    throttledFn();
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('Object Utilities', () => {
  it('should create deep clone', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
  });

  it('should pick specified properties', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const picked = pick(obj, ['a', 'c']);
    expect(picked).toEqual({ a: 1, c: 3 });
  });

  it('should omit specified properties', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const omitted = omit(obj, ['b']);
    expect(omitted).toEqual({ a: 1, c: 3 });
  });

  it('should merge objects deeply', () => {
    const obj1 = { a: 1, b: { c: 2 } };
    const obj2 = { b: { d: 3 }, e: 4 };
    const merged = merge(obj1, obj2);
    expect(merged).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });

  it('should check if object is empty', () => {
    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty('')).toBe(true);
  });
});

describe('String Utilities', () => {
  it('should generate valid UUID', () => {
    const id = uuid();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should generate random string', () => {
    const str = randomString(10);
    expect(str).toHaveLength(10);
  });

  it('should generate hash', () => {
    const hashValue = hash('test');
    expect(hashValue).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should validate email', () => {
    expect(isEmail('test@example.com')).toBe(true);
    expect(isEmail('invalid')).toBe(false);
  });

  it('should validate URL', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('invalid')).toBe(false);
  });

  it('should capitalize', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('should truncate', () => {
    expect(truncate('hello world', 5)).toBe('he...');
    expect(truncate('hello', 10)).toBe('hello');
  });
});

describe('Array Utilities', () => {
  it('should shuffle array', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should generate random int', () => {
    const num = randomInt(1, 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(10);
  });
});

describe('Query String Utilities', () => {
  it('should parse query string', () => {
    const result = fromQueryString('a=1&b=2');
    expect(result).toEqual({ a: '1', b: '2' });
  });

  it('should convert to query string', () => {
    const result = toQueryString({ a: 1, b: 'test' });
    expect(result).toBe('a=1&b=test');
  });
});

describe('File Utilities', () => {
  it('should format bytes', () => {
    expect(bytes(1024)).toBe('1.00 KB');
    expect(bytes(1048576)).toBe('1.00 MB');
  });
});

describe('Environment Utilities', () => {
  beforeEach(() => {
    process.env.TEST_VAR = 'test-value';
    process.env.NUMBER_VAR = '42';
    process.env.BOOL_VAR = 'true';
  });

  it('should get string env vars', () => {
    expect(env.string('TEST_VAR')).toBe('test-value');
    expect(env.string('NON_EXISTENT', 'default')).toBe('default');
  });

  it('should get number env vars', () => {
    expect(env.number('NUMBER_VAR')).toBe(42);
  });

  it('should get boolean env vars', () => {
    expect(env.bool('BOOL_VAR')).toBe(true);
  });
});
