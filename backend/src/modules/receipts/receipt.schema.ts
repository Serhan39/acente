import { z } from "zod";

const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const scanReceiptSchema = z.object({
  // Data URI önekiyle ("data:image/jpeg;base64,...") veya çıplak base64 olarak kabul edilir.
  image: z.string().min(100, "Geçerli bir fiş görüntüsü gönderin"),
  mimeType: z.enum(SUPPORTED_MIME_TYPES).default("image/jpeg"),
});
