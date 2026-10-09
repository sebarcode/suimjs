// State can be made reactive by the caller (e.g. Vue's reactive()).
export function createLookupPager(fetchPage, state = {}) {
    Object.assign(state, { items: [], loading: false, hasMore: false, error: null });
    let generation = 0;
    let request;
    let keyOf;
    let skip = 0;
    let take = 100;

    function clear() {
        generation++;
        request = null;
        Object.assign(state, { items: [], loading: false, hasMore: false, error: null });
    }

    async function reset(nextRequest, getKey) {
        clear();
        request = { url: nextRequest.url, payload: { ...nextRequest.payload } };
        keyOf = getKey;
        skip = Number(request.payload.Skip) || 0;
        take = request.payload.Take == null ? 100 : Number(request.payload.Take);
        state.hasMore = true;
        return loadMore();
    }

    async function loadMore() {
        if (!request || state.loading || !state.hasMore) return false;
        const currentGeneration = generation;
        const currentKeyOf = keyOf;
        const pageRequest = {
            url: request.url,
            payload: { ...request.payload, Take: take, Skip: skip },
        };
        state.loading = true;
        state.error = null;
        try {
            const rows = await fetchPage(pageRequest);
            if (currentGeneration !== generation) return false;
            if (!Array.isArray(rows)) throw new TypeError('Lookup response must be an array');
            const keys = new Set(state.items.map(currentKeyOf));
            const added = [];
            for (const row of rows) {
                const key = currentKeyOf(row);
                if (!keys.has(key)) {
                    keys.add(key);
                    added.push(row);
                }
            }
            state.items = [...state.items, ...added];
            // Count server rows, not unique options or separately fetched selections.
            skip += rows.length;
            // A duplicate-only page also stops APIs that ignore Skip.
            state.hasMore = take > 0 && rows.length > 0 && added.length > 0;
            return true;
        } catch (error) {
            if (currentGeneration === generation) state.error = error;
            return false;
        } finally {
            if (currentGeneration === generation) state.loading = false;
        }
    }

    return { state, reset, loadMore, clear };
}
