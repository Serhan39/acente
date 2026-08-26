import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  // Fiş/fatura fotoğrafından otomatik işlem oluşturma özelliği için gerekli.
  // Tanımlı değilse özellik kapalı sayılır, sunucu yine de açılır.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
};
