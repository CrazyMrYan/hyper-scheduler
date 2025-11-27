import { describe, it, expect } from 'vitest';
import { RetryStrategy } from '../../src/core/RetryStrategy';

describe('RetryStrategy', () => {
  it('should return -1 if no options are provided', () => {
    expect(RetryStrategy.getDelay(0, undefined)).toBe(-1);
  });

  it('should return correct exponential backoff delay', () => {
    const options = { maxAttempts: 3, initialDelay: 1000, factor: 2 };
    
    expect(RetryStrategy.getDelay(0, options)).toBe(1000); // 1000 * 2^0
    expect(RetryStrategy.getDelay(1, options)).toBe(2000); // 1000 * 2^1
    expect(RetryStrategy.getDelay(2, options)).toBe(4000); // 1000 * 2^2
  });

  it('should return -1 if attempts exceed maxAttempts', () => {
    const options = { maxAttempts: 3, initialDelay: 1000, factor: 2 };
    expect(RetryStrategy.getDelay(3, options)).toBe(-1);
  });
});
