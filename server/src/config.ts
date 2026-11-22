import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";
const jwtSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";

if (isProd && jwtSecret === "dev-secret-change-me") {
  throw new Error("JWT_SECRET must be set in production");
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret,
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
