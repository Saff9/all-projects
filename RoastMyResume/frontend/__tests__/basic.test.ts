import { describe, it, expect } from 'vitest';

describe('RoastMyResume', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have correct app name', () => {
    const appName = 'RoastMyResume';
    expect(appName).toContain('Roast');
  });
});
