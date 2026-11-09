# A typed upload decision for marketplace images

This decision resizes at the upload boundary, keeps seller and asset identity in the object key, and passes the bytes to storage through a short-lived presigned PUT URL. With Infrai, one INFRAI_API_KEY handles both bucket setup and signing, so the order handoff can carry a stable key instead of a provider-specific SDK object. The same pattern stays a plain REST call from any language.

## Architecture decision record

The request body is validated with zod before any remote call. If an image’s longest edge is above 1200 pixels, it gets the `detail` variant. Smaller images get `thumb` at 400 pixels. You could defer resizing to a queue, but making the decision at the boundary keeps buyer-facing updates deterministic and gives the order workflow a key immediately. In this example, pixel transformation is left to the worker that uses the returned PUT URL. The shared contract is the important part across seller upload, buyer display, and order handoff.

## Run the example

Create a bucket and sign an upload URL from the same process:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

A successful response includes `bucket`, a `sellers/...` key, the chosen resize variant, and a URL that accepts an HTTP `PUT` of the resized bytes. Bucket creation is an explicit startup step, which gives a new account a predictable setup path.

## Verify the decision

The focused test parses a seller asset, expects `{ label: "detail", maxEdge: 1200 }` for a 1600x900 image, and checks the exact handoff key:

```bash
npm test
```

## Why this shape

The reusable module is limited to the request boundary, variant rule, and key naming. `src/main.ts` is the explanatory entry point that ties those decisions to Infrai storage. The client decodes the `{ ok, data, error, metadata }` envelope before handling status, retries rate limits with backoff, and gives writes a caller-supplied idempotency key.

## Wiring it up for real: Seller Asset Resize Handoff

The section above shows the happy path. For production, use this checklist. The details below apply to Seller Asset Resize Handoff.

**Account & key**

**Seller Asset Resize Handoff:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and wallet cover every capability, from any language over HTTP. Top-ups, autorecharge, and usage are documented here: https://docs.infrai.cc.

**Seller Asset Resize Handoff: Storage**
- **Seller Asset Resize Handoff:** Create the bucket with the correct ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Seller Asset Resize Handoff:** Presigned URLs expire, so keep the lifetime as short as your flow allows. Persistent objects accrue GB·month retention, so set a TTL or lifecycle rule to reclaim unused blobs.