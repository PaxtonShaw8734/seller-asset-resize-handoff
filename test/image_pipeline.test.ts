import test from "node:test";
import assert from "node:assert/strict";
import { chooseVariant, uploadRequest, objectKey } from "../src/image_pipeline.ts";

test("large seller photo is assigned the detail resize and stable handoff key", () => {
  const input = uploadRequest.parse({ sellerId: "s1", assetId: "a9", width: 1600, height: 900, contentType: "image/webp" });
  assert.deepEqual(chooseVariant(input.width, input.height), { label: "detail", maxEdge: 1200 });
  assert.equal(objectKey(input), "sellers/s1/assets/a9-detail.webp");
});
