import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "123456789",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
}));
