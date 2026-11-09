import { infrai } from "./infrai.ts";
import { objectKey, uploadRequest, chooseVariant } from "./image_pipeline.ts";

const request = uploadRequest.parse({ sellerId: "seller-42", assetId: "shoe-front", width: 2400, height: 1800, contentType: "image/jpeg" });
const bucket = "marketplace-images";
await infrai.storage.bucket.create({ name: bucket });
const key = objectKey(request);
const variant = chooseVariant(request.width, request.height);
const { url } = await infrai.storage.object.presign(bucket, key, { op: "put", expires_seconds: 600, content_type: request.contentType, idempotency_key: `${request.sellerId}:${request.assetId}:${variant.label}` });
console.log(JSON.stringify({ bucket, key, resize: variant, upload: { method: "PUT", url } }, null, 2));
