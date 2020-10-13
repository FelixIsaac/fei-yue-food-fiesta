import fastify from "fastify";
import path from "path";
import fs from "fs";
require("dotenv").config({ "path": path.resolve(__dirname, "../", ".env") });

const app = fastify({ "logger": true });
app.register(import("fastify-compress"));
app.register(import("fastify-cors"));
app.register(import("fastify-cookie"), { "secret": "" });
app.register(import("fastify-csrf"), { "cookieOpts": { "signed": true } });
app.register(import("fastify-jwt"), { "secret": process.env.JWT_ENCRYPTION_SECRET as string });
app.register(import("fastify-helmet"))
app.register(require("fastify-rate-limit"), { "max": 100, "timeWindow": "1 minute" });

// routes
app.register(import("./routes/user/user-route"), { "prefix": "/api/v1/user" })

app.listen(3000, (err, address) => err ? app.log.error(err) : app.log.info(`Listening on ${address}`));
