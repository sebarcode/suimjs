const DEFAULT_TTL_MS = 60 * 1000;

const resolvedCache = new Map();
const inflightCache = new Map();

function stableSerialize(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function cacheKey(scope, payload) {
  return `${scope}::${stableSerialize(payload)}`;
}

function getResolved(key) {
  const entry = resolvedCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    resolvedCache.delete(key);
    return null;
  }

  return entry.value;
}

export async function getCachedLookup(scope, payload, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const key = cacheKey(scope, payload);
  const cached = getResolved(key);
  if (cached !== null) return cached;

  const inflight = inflightCache.get(key);
  if (inflight) return inflight;

  const request = Promise.resolve()
    .then(fetcher)
    .then((result) => {
      resolvedCache.set(key, {
        value: result,
        expiresAt: Date.now() + ttlMs,
      });
      inflightCache.delete(key);
      return result;
    })
    .catch((error) => {
      inflightCache.delete(key);
      throw error;
    });

  inflightCache.set(key, request);
  return request;
}

export function clearLookupCache(scope = "") {
  if (!scope) {
    resolvedCache.clear();
    inflightCache.clear();
    return;
  }

  const prefix = `${scope}::`;
  [...resolvedCache.keys()].forEach((key) => {
    if (key.startsWith(prefix)) resolvedCache.delete(key);
  });
  [...inflightCache.keys()].forEach((key) => {
    if (key.startsWith(prefix)) inflightCache.delete(key);
  });
}
