import fastify from "fastify";
import path from "path";
import { parse } from "cookie";
import { unsign } from "cookie-signature";
import { isAdmin } from "./routes/user/user-ctrl";

require("dotenv").config({ "path": path.resolve(__dirname, "../", ".env") });
require("./database");

const app = fastify({ "logger": true });

// app.register(import("fastify-compress"));
app.register(require('fastify-websocket'), {
    handle(conn: any) { conn.pipe(conn) },
    options: {
        maxPayload: 1048576,
        verifyClient: async function (info: any, next: any) {
            const { token: signedToken } = parse(info.req.headers.cookie || "");

            if (!signedToken) {
                next(false);
                return;
            }

            const token = unsign(signedToken, process.env.COOKIE_SESSION_SECRET as string);
            next(token && await isAdmin(token));
        }
    }
})

app.register(import("fastify-cors"), { origin: [process.env.FRONT_DOMAIN as string], credentials: true });
app.register(import("fastify-cookie"), { "secret": process.env.COOKIE_SESSION_SECRET });
// @ts-ignore
app.register(import("fastify-csrf"), {
    "cookieOpts": {
        "signed": true,
        "secret": process.env.COOKIE_SESSION_SECRET
    },
    "sessionKey": process.env.COOKIE_SESSION_SECRET
});
app.register(import("fastify-helmet"));
app.register(require("fastify-rate-limit"), { "max": 100, "timeWindow": "1 minute" });

// routes
app.register(import("./routes/user/user-route"), { "prefix": "/api/v1/user" });
app.register(import("./routes/item/item-route"), { "prefix": "/api/v1/item" });

app.listen(3000, (err, address) => err ? app.log.error(err) : app.log.info(`Listening on ${address}`));
