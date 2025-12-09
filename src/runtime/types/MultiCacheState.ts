/**
 * Interface for managing cache revalidation state across multiple server instances.
 *
 * This interface defines the contract for tracking which cache keys are currently
 * being revalidated to implement stale-while-revalidate (SWR) functionality.
 *
 * ## Implementations
 *
 * - **InMemoryMultiCacheState**: Default implementation for single-node deployments
 * - **Custom implementations**: Implement this interface for multi-node clusters or specialized behavior
 *
 * ## Usage
 *
 * ### Implement the interface
 * ```typescript
 * import type { IMultiCacheState } from 'nuxt-multi-cache/dist/runtime/types'
 *
 * export class MongoMultiCacheState implements IMultiCacheState {
 *   async addKeyBeingRevalidated(key: string): Promise<void> {
 *     // Your MongoDB implementation
 *   }
 *
 *   async isBeingRevalidated(key: string): Promise<boolean> {
 *     // Your MongoDB implementation
 *     return false
 *   }
 *
 *   async removeKeyBeingRevalidated(key: string): Promise<void> {
 *     // Your MongoDB implementation
 *   }
 * }
 * ```
 *
 * ### Use in configuration
 * ```typescript
 * export default defineNuxtConfig({
 *   modules: ['nuxt-multi-cache'],
 *   multiCache: {
 *     state: () => new MongoMultiCacheState(mongoClient, { ... })
 *   }
 * })
 * ```
 */
export interface MultiCacheState {
  /**
   * Mark a cache key as currently being revalidated.
   *
   * This method is called when a stale cache entry is about to be revalidated.
   * It prevents other concurrent requests from also attempting to revalidate
   * the same key.
   *
   * @param key - The cache key being revalidated
   *
   * @example
   * ```typescript
   * await state.addKeyBeingRevalidated('products:123')
   * // Now other requests will see this key is being revalidated
   * ```
   */
  addKeyBeingRevalidated(key: string): Promise<void>

  /**
   * Check if a cache key is currently being revalidated.
   *
   * This method is called to determine if another request/instance is already
   * revalidating this key. If true, the current request should serve stale
   * content instead of also revalidating.
   *
   * @param key - The cache key to check
   * @returns True if the key is being revalidated, false otherwise
   *
   * @example
   * ```typescript
   * if (await state.isBeingRevalidated('products:123')) {
   *   // Another instance is revalidating, serve stale content
   *   return cachedContent
   * }
   * ```
   */
  isBeingRevalidated(key: string): Promise<boolean>

  /**
   * Remove the revalidation flag for a cache key.
   *
   * This method is called after a cache key has been successfully revalidated
   * and stored back in cache. It signals that other requests can now revalidate
   * this key if needed.
   *
   * @param key - The cache key that finished revalidating
   *
   * @example
   * ```typescript
   * try {
   *   // Revalidate and store in cache
   *   await cache.set(key, newValue)
   * } finally {
   *   // Always clear the flag
   *   await state.removeKeyBeingRevalidated('products:123')
   * }
   * ```
   */
  removeKeyBeingRevalidated(key: string): Promise<void>
}
