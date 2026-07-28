/**
 * 数据懒加载工具
 * 用于优化大型数据文件的加载性能
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  promise: Promise<T> | null;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 带缓存的懒加载数据
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 缓存过期时间（毫秒）
 * @returns Promise<T>
 */
export async function lazyLoad<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = cache.get(key);
  const now = Date.now();

  // 如果有有效缓存，直接返回
  if (cached && now - cached.timestamp < ttl) {
    return cached.data;
  }

  // 如果有正在进行的请求，等待它完成
  if (cached?.promise) {
    return cached.promise;
  }

  // 创建新请求
  const promise = fetcher().then((data) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      promise: null,
    });
    return data;
  }).catch((error) => {
    // 请求失败时清除缓存
    cache.delete(key);
    throw error;
  });

  // 缓存 promise 以防止重复请求
  cache.set(key, {
    data: cached?.data ?? null,
    timestamp: cached?.timestamp ?? 0,
    promise,
  });

  return promise;
}

/**
 * 预加载数据（不等待结果）
 * @param key 缓存键
 * @param fetcher 数据获取函数
 */
export function prefetch<T>(key: string, fetcher: () => Promise<T>): void {
  const cached = cache.get(key);
  if (!cached || Date.now() - cached.timestamp > CACHE_TTL) {
    lazyLoad(key, fetcher).catch(() => {
      // 静默处理预加载错误
    });
  }
}

/**
 * 清除指定缓存
 * @param key 缓存键
 */
export function invalidateCache(key: string): void {
  cache.delete(key);
}

/**
 * 清除所有缓存
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * 获取缓存状态
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}
