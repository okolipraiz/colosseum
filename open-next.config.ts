// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
	// Without an incremental cache the adapter falls back to the "dummy"
	// implementation, so nothing is ever persisted and every request re-renders
	// from scratch. A burst of <Link> prefetches (each one an ?_rsc= RSC fetch)
	// then burns enough CPU to trip "Worker exceeded CPU time limit".
	//
	// KV is used rather than R2 because this account has R2 disabled. This app
	// has no revalidatePath/revalidateTag and no `revalidate` route exports, so
	// only build-time prerendered routes are ever cached — those are immutable,
	// which makes KV's eventual consistency a non-issue.
	// See https://opennext.js.org/cloudflare/caching for more details.
	incrementalCache: kvIncrementalCache,
});
