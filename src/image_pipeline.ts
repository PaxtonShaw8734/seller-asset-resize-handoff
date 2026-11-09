import { z } from "zod";

export const uploadRequest = z.object({ sellerId: z.string().min(1), assetId: z.string().min(1), width: z.number().int().positive(), height: z.number().int().positive(), contentType: z.enum(["image/jpeg", "image/png", "image/webp"]) });
export type UploadRequest = z.infer<typeof uploadRequest>;

export function chooseVariant(width: number, height: number): { label: "thumb" | "detail"; maxEdge: number } {
  return Math.max(width, height) > 1200 ? { label: "detail", maxEdge: 1200 } : { label: "thumb", maxEdge: 400 };
}

export function objectKey(input: UploadRequest): string {
  const variant = chooseVariant(input.width, input.height);
  return `sellers/${input.sellerId}/assets/${input.assetId}-${variant.label}.${input.contentType.split("/")[1]}`;
}
