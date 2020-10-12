import fastify from "fastify";

const app = fastify({ "logger": true });
app.register(import("fastify-compress"));
app.register(import("fastify-cors"));
app.register(import("fastify-cookie"), { "secret": "" });
app.register(import("fastify-csrf"), { "cookieOpts": { "signed": true } });
app.register(import("fastify-jwt"), { "secret": "supersecret" });
app.register(import("fastify-helmet"))
app.register(require("fastify-rate-limit"), { "max": 100, "timeWindow": "1 minute" });



app.listen(3000, (err, address) => err ? app.log.error(err) : app.log.info(`Listening on ${address}`));
