function parseLookupUrl(lookupUrl) {
  const rawUrl = String(lookupUrl || "");
  const hashIndex = rawUrl.indexOf("#");
  const hash = hashIndex >= 0 ? rawUrl.slice(hashIndex) : "";
  const urlWithoutHash = hashIndex >= 0 ? rawUrl.slice(0, hashIndex) : rawUrl;
  const queryIndex = urlWithoutHash.indexOf("?");

  if (queryIndex < 0) {
    return { url: rawUrl, sort: [] };
  }

  const baseUrl = urlWithoutHash.slice(0, queryIndex);
  const params = new URLSearchParams(urlWithoutHash.slice(queryIndex + 1));
  const sort = [];

  for (const key of [...new Set(params.keys())]) {
    if (key.toLowerCase() !== "sortby") continue;

    for (const value of params.getAll(key)) {
      sort.push(...value.split(",").map((field) => field.trim()).filter(Boolean));
    }
    params.delete(key);
  }

  const query = params.toString();
  return {
    url: `${baseUrl}${query ? `?${query}` : ""}${hash}`,
    sort,
  };
}

function findNameField(lookupLabels, lookupSearchs) {
  const fields = [...(lookupLabels || []), ...(lookupSearchs || [])];
  return fields.find(
    (field) => typeof field === "string" && field.toLowerCase() === "name"
  );
}

export function buildLookupRequest(
  lookupUrl,
  payload = {},
  lookupLabels = [],
  lookupSearchs = []
) {
  const parsed = parseLookupUrl(lookupUrl);
  const requestPayload = { ...(payload || {}) };

  if (parsed.sort.length > 0) {
    requestPayload.Sort = parsed.sort;
  } else if (!Array.isArray(requestPayload.Sort) || requestPayload.Sort.length === 0) {
    const nameField = findNameField(lookupLabels, lookupSearchs);
    if (nameField) requestPayload.Sort = [nameField];
  }

  return {
    url: parsed.url,
    payload: requestPayload,
  };
}
