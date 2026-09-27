import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../components/SForm.vue", import.meta.url), "utf8");

test("tab close activates an inactive form and cancels on the same click", () => {
  const closeButton = source.match(
    /<button\s+[\s\S]*?class="close-button"[\s\S]*?<\/button>/,
  )?.[0];

  assert.ok(closeButton, "tab close button must exist");
  assert.match(closeButton, /type="button"/);
  assert.match(closeButton, /@click="activateAndCancelForm"/);
  assert.doesNotMatch(closeButton, /:disabled="isLockedByOtherForm"/);

  assert.match(
    source,
    /function activateAndCancelForm\(\)\s*{\s*markAsActive\(\);\s*onCancelForm\(\);\s*}/,
  );
});
