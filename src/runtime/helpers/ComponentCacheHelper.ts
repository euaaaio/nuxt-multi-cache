import { CacheHelper } from './CacheHelper'

export const INJECT_COMPONENT_CACHE_CONTEXT = Symbol(
  'multi_cache_component_cache_helper',
)

export class ComponentCacheHelper extends CacheHelper {
  payloadKeys: string[] = []

  /**
   * Whether a stale response can be served during revalidation.
   */
  staleWhileRevalidate: boolean | null = null

  /**
   * Add payload keys for which the value should be extracted and stored
   * in cache.
   */
  public addPayloadKeys(keys: string | string[]): this {
    if (Array.isArray(keys)) {
      this.payloadKeys.push(...keys)
    } else if (typeof keys === 'string') {
      this.payloadKeys.push(keys)
    }

    return this
  }

  /**
   * Sets whether a stale response can be returned while a new one is being generated.
   */
  public allowStaleWhileRevalidate(): this {
    this.staleWhileRevalidate = true
    return this
  }
}
