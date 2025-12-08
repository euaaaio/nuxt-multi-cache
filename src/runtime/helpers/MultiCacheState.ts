import type { Storage } from 'unstorage'

export class MultiCacheState {
  /**
   * Keys that are currently being revalidated (in-memory fallback).
   */
  private keysBeingRevalidated = new Set<string>()

  /**
   * Optional shared storage for distributed state (e.g., MongoDB, Redis).
   * When provided, enables SWR coordination across multiple server instances.
   */
  private storage?: Storage

  /**
   * TTL for revalidation flags in seconds.
   * Auto-cleanup in case of server crashes or errors.
   */
  private revalidationTTL: number

  constructor(storage?: Storage, revalidationTTL: number = 120) {
    this.storage = storage
    this.revalidationTTL = revalidationTTL
  }

  /**
   * Add a key that is currently being revalidated.
   */
  async addKeyBeingRevalidated(key: string): Promise<void> {
    if (this.storage) {
      await this.storage.setItem(`revalidating:${key}`, true, {
        ttl: this.revalidationTTL,
      })
    } else {
      this.keysBeingRevalidated.add(key)
    }
  }

  /**
   * Remove a key from being revalidated.
   */
  async removeKeyBeingRevalidated(key: string): Promise<void> {
    if (this.storage) {
      await this.storage.removeItem(`revalidating:${key}`)
    } else {
      this.keysBeingRevalidated.delete(key)
    }
  }

  /**
   * Check if a key is currently being revalidated.
   */
  async isBeingRevalidated(key: string): Promise<boolean> {
    if (this.storage) {
      return !!(await this.storage.getItem(`revalidating:${key}`))
    }
    return this.keysBeingRevalidated.has(key)
  }
}
