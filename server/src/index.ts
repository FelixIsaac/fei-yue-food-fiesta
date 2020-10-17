import fastify from "fastify";
import path from "path";

require("dotenv").config({ "path": path.resolve(__dirname, "../", ".env") });
require("./database");

const app = fastify({ "logger": true });
app.register(import("fastify-compress"));
app.register(import("fastify-cors"));
app.register(import("fastify-cookie"), { "secret": process.env.COOKIE_SESSION_SECRET });
app.register(import("fastify-csrf"), { "cookieOpts": { "signed": true } });
app.register(import("fastify-helmet"))
app.register(require("fastify-rate-limit"), { "max": 100, "timeWindow": "1 minute" });

// routes
app.register(import("./routes/user/user-route"), { "prefix": "/api/v1/user" });
app.register(import("./routes/item/item-route"), { "prefix": "/api/v1/item" });

app.listen(3000, (err, address) => err ? app.log.error(err) : app.log.info(`Listening on ${address}`));
