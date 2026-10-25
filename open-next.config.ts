import {defineCloudflareConfig} from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// All content is prerendered at build time; no writable cache or database is required.
export default defineCloudflareConfig({
 incrementalCache:staticAssetsIncrementalCache,
 enableCacheInterception:true,
})
