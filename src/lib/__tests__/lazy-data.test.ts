import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lazyLoad, prefetch, invalidateCache, clearCache, getCacheStats } from '../lazy-data';

describe('lazyLoad', () => {
  beforeEach(() => {
    clearCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should load data and cache it', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });

    const result1 = await lazyLoad('test-key', fetcher);
    expect(result1).toEqual({ data: 'test' });
    expect(fetcher).toHaveBeenCalledTimes(1);

    const result2 = await lazyLoad('test-key', fetcher);
    expect(result2).toEqual({ data: 'test' });
    expect(fetcher).toHaveBeenCalledTimes(1); // 不应该再次调用
  });

  it('should reload data after cache expires', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ data: 'first' })
      .mockResolvedValueOnce({ data: 'second' });

    const result1 = await lazyLoad('test-key', fetcher, 1000);
    expect(result1).toEqual({ data: 'first' });

    // 快进时间超过缓存TTL
    vi.advanceTimersByTime(1500);

    const result2 = await lazyLoad('test-key', fetcher, 1000);
    expect(result2).toEqual({ data: 'second' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should handle concurrent requests', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });

    const [result1, result2] = await Promise.all([
      lazyLoad('test-key', fetcher),
      lazyLoad('test-key', fetcher),
    ]);

    expect(result1).toEqual({ data: 'test' });
    expect(result2).toEqual({ data: 'test' });
    expect(fetcher).toHaveBeenCalledTimes(1); // 只应该调用一次
  });

  it('should handle fetch errors', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(lazyLoad('test-key', fetcher)).rejects.toThrow('Network error');
    expect(fetcher).toHaveBeenCalledTimes(1);

    // 错误后应该可以重试
    fetcher.mockResolvedValue({ data: 'retried' });
    const result = await lazyLoad('test-key', fetcher);
    expect(result).toEqual({ data: 'retried' });
  });
});

describe('prefetch', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should prefetch data without blocking', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });

    prefetch('test-key', fetcher);

    // 等待异步操作完成
    await vi.waitFor(() => {
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    // 后续调用应该使用缓存
    const result = await lazyLoad('test-key', fetcher);
    expect(result).toEqual({ data: 'test' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe('invalidateCache', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should invalidate specific cache entry', async () => {
    const fetcher1 = vi.fn().mockResolvedValue({ data: 'value1' });
    const fetcher2 = vi.fn().mockResolvedValue({ data: 'value2' });

    await lazyLoad('key1', fetcher1);
    await lazyLoad('key2', fetcher2);

    expect(fetcher1).toHaveBeenCalledTimes(1);
    expect(fetcher2).toHaveBeenCalledTimes(1);

    invalidateCache('key1');

    // key1需要重新加载，key2使用缓存
    const result1 = await lazyLoad('key1', fetcher1);
    const result2 = await lazyLoad('key2', fetcher2);

    expect(result1).toEqual({ data: 'value1' });
    expect(result2).toEqual({ data: 'value2' });
    expect(fetcher1).toHaveBeenCalledTimes(2); // 重新加载
    expect(fetcher2).toHaveBeenCalledTimes(1); // 使用缓存
  });
});

describe('clearCache', () => {
  it('should clear all cache entries', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });

    await lazyLoad('key1', fetcher);
    await lazyLoad('key2', fetcher);

    clearCache();

    const stats = getCacheStats();
    expect(stats.size).toBe(0);
  });
});

describe('getCacheStats', () => {
  beforeEach(() => {
    clearCache();
  });

  it('should return cache statistics', async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: 'test' });

    await lazyLoad('key1', fetcher);
    await lazyLoad('key2', fetcher);

    const stats = getCacheStats();
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('key1');
    expect(stats.keys).toContain('key2');
  });
});
