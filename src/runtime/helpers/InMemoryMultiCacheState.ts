import type { MultiCacheState } from '../types/MultiCacheState'

/**
 * In-memory implementation of MultiCacheState for single-node deployments.
 *
 * This implementation stores revalidation flags in memory using a Map.
 * Uses lazy cleanup strategy: expired entries are removed only when checked.
 *
 * ## Features
 * - No external dependencies (pure in-memory)
 * - Lazy cleanup on read
 * - Simple and fast
 * - No background timers
 *
 * ## Limitations
 * - Only works within a single server instance
 * - Does not coordinate revalidation across multiple nodes
 * - State is lost on server restart
 *
 * ## Usage
 *
 * This is the **default implementation** used when no custom state is provided.
 *
 * For multi-node deployments, implement MultiCacheState with:
 * - MongoDB (see examples/MongoMultiCacheState.ts)
 * - Redis
 * - Any other shared storage solution
 *
 * @example
 * ```typescript
 * // Default usage (automatic)
 * export default defineNuxtConfig({
 *   modules: ['nuxt-multi-cache'],
 *   multiCache: {
 *     // InMemoryMultiCacheState is used by default
 *   }
 * })
 *
 * // With custom TTL
 * export default defineNuxtConfig({
 *   modules: ['nuxt-multi-cache'],
 *   multiCache: {
 *     state: {
 *       revalidationTTL: 300 // 5 minutes
 *     }
 *   }
 * })
 * ```
 */
export class InMemoryMultiCacheState implements MultiCacheState {
  /**
   * In-memory map of keys being revalidated with expiration timestamps.
   * Map<key, expiresAt>
   */
  private keysBeingRevalidated = new Map<string, number>()

  /**
   * TTL for revalidation flags in seconds.
   */
  private revalidationTTL: number

  constructor(revalidationTTL: number = 120) {
    this.revalidationTTL = revalidationTTL
  }

  /**
   * Add a key that is currently being revalidated.
   */
  async addKeyBeingRevalidated(key: string): Promise<void> {
    const expiresAt = Date.now() + this.revalidationTTL * 1000
    this.keysBeingRevalidated.set(key, expiresAt)
  }

  /**
   * Remove a key from being revalidated.
   */
  async removeKeyBeingRevalidated(key: string): Promise<void> {
    this.keysBeingRevalidated.delete(key)
  }

  /**
   * Check if a key is currently being revalidated.
   * Performs lazy cleanup: expired keys are automatically removed and return false.
   */
  async isBeingRevalidated(key: string): Promise<boolean> {
    const expiresAt = this.keysBeingRevalidated.get(key)
    if (!expiresAt) return false

    // Check if expired (lazy cleanup)
    if (Date.now() > expiresAt) {
      this.keysBeingRevalidated.delete(key)
      return false
    }

    return true
  }

  /**
   * Clean up resources.
   * No-op for in-memory implementation (lazy cleanup is sufficient).
   */
  destroy() {
    // No-op: lazy cleanup handles memory management
  }
}
