import assert from "node:assert/strict";
import test from "node:test";

import { buildLookupRequest } from "./lookup_request.mjs";

test("defaults lookup sorting to Name when the field is available", () => {
  const request = buildLookupRequest("/sales/customer/find", { Take: 20 }, ["Code", "Name"]);

  assert.equal(request.url, "/sales/customer/find");
  assert.deepEqual(request.payload.Sort, ["Name"]);
});

test("sortby overrides payload and default lookup sorting", () => {
  const request = buildLookupRequest(
    "/sales/customer/find?tenant=Demo&sortby=DateCreated,-Name#options",
    { Sort: ["Name"] },
    ["Name"]
  );

  assert.equal(request.url, "/sales/customer/find?tenant=Demo#options");
  assert.deepEqual(request.payload.Sort, ["DateCreated", "-Name"]);
});

test("supports repeated sortby parameters without mutating the source payload", () => {
  const payload = { Take: 100 };
  const request = buildLookupRequest(
    "/sales/customer/find?sortby=-DateCreated&sortBy=Name",
    payload,
    ["Name"]
  );

  assert.deepEqual(request.payload.Sort, ["-DateCreated", "Name"]);
  assert.deepEqual(payload, { Take: 100 });
});

test("keeps an existing payload sort when there is no URL override", () => {
  const request = buildLookupRequest(
    "/sales/customer/find",
    { Sort: ["Code"] },
    ["Name"]
  );

  assert.deepEqual(request.payload.Sort, ["Code"]);
});

test("does not add a default sort when Name is unavailable", () => {
  const request = buildLookupRequest("/sales/customer/find", { Take: 20 }, ["Code"]);

  assert.equal(request.payload.Sort, undefined);
});
