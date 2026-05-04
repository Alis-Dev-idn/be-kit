import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: [
    "express",
    "fastify",
    "mongoose",
    "nodemailer",
    "resend",
    "redis",
    "bullmq",
    "node-cron",
    "eventemitter2",
    "socket.io",
    "ws",
    "reflect-metadata"
  ]
})
