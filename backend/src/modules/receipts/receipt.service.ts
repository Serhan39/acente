import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
// zodOutputFormat requires Zod v4 schema types; the rest of the codebase uses the
// classic (v3) API from "zod", so this module imports the v4 compat build directly.
import { z } from "zod/v4";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";

const RECEIPT_MODEL = "claude-opus-5";

const ReceiptExtractionSchema = z.object({
  isReceipt: z.boolean().describe("Görüntü okunabilir bir fiş/fatura ise true"),
  rejectionReason: z
    .string()
    .nullable()
    .describe("isReceipt false ise kısa, Türkçe bir açıklama; aksi halde null"),
  type: z.enum(["INCOME", "EXPENSE"]).describe("Çoğu fiş bir gider (EXPENSE)'dir"),
  amount: z.number().describe("Fişteki toplam tutar (KDV dahil), sayı olarak"),
  date: z
    .string()
    .nullable()
    .describe("Fişte yazan tarih, ISO 8601 (YYYY-MM-DD) formatında; görünmüyorsa null"),
  vendor: z.string().nullable().describe("Satıcı/işletme adı"),
  description: z.string().describe("Kısa, Türkçe bir işlem açıklaması (ör. 'Migros - market alışverişi')"),
  suggestedCategory: z
    .string()
    .nullable()
    .describe("Bu işlem için uygun Türkçe kategori adı tahmini (ör. 'Yemek', 'Ulaşım', 'Ofis Malzemesi')"),
});

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!env.anthropicApiKey) {
    throw ApiError.badRequest(
      "Fiş tarama özelliği kullanılamıyor: ANTHROPIC_API_KEY tanımlı değil. Sunucu ortam değişkenlerine ekleyip yeniden başlatın.",
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return client;
}

export interface ScanReceiptInput {
  image: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}

export interface ScanReceiptResult {
  type: "INCOME" | "EXPENSE";
  amount: number;
  date: string | null;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
}

function stripDataUriPrefix(image: string): string {
  const commaIndex = image.indexOf(",");
  if (image.startsWith("data:") && commaIndex !== -1) {
    return image.slice(commaIndex + 1);
  }
  return image;
}

export async function scanReceipt(userId: string, input: ScanReceiptInput): Promise<ScanReceiptResult> {
  const anthropic = getClient();
  const base64Data = stripDataUriPrefix(input.image);

  let response;
  try {
    response = await anthropic.messages.parse({
      model: RECEIPT_MODEL,
      max_tokens: 2048,
      output_config: {
        effort: "low",
        format: zodOutputFormat(ReceiptExtractionSchema),
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: input.mimeType, data: base64Data },
            },
            {
              type: "text",
              text: "Bu bir fiş veya fatura fotoğrafı. Muhasebe yazılımına otomatik işlem girişi için gerekli alanları çıkar.",
            },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw ApiError.badRequest("ANTHROPIC_API_KEY geçersiz. Sunucu ortam değişkenini kontrol edin.");
    }
    if (err instanceof Anthropic.APIError) {
      throw ApiError.badRequest("Fiş taranırken bir hata oluştu, tekrar deneyin");
    }
    throw err;
  }

  const parsed = response.parsed_output;
  if (!parsed || !parsed.isReceipt || !parsed.amount || parsed.amount <= 0) {
    throw ApiError.badRequest(parsed?.rejectionReason || "Görüntüde bir fiş/fatura tanınamadı, lütfen net bir fotoğraf çekin");
  }

  let categoryId: string | null = null;
  if (parsed.suggestedCategory) {
    const category = await prisma.category.findFirst({
      where: {
        userId,
        type: parsed.type,
        name: { equals: parsed.suggestedCategory, mode: "insensitive" },
      },
    });
    categoryId = category?.id ?? null;
  }

  return {
    type: parsed.type,
    amount: parsed.amount,
    date: parsed.date,
    description: parsed.vendor ? `${parsed.vendor} - ${parsed.description}` : parsed.description,
    categoryId,
    categoryName: parsed.suggestedCategory,
  };
}
