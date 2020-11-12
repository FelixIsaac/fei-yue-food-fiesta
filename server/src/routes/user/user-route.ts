import { FastifyError, FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userController from "./user-ctrl";
import { IUserDocument } from "../../database/models/UserModel";
import {
    amendUser,
    deleteSchema,
    getUserItemsHistorySchema,
    loginSchema,
    registerUser,
    resetUserItemsSchema,
    updateItemsSchema
} from "./user-route-schema";
import handleError, { handleSuccess } from "../../utils/handleError";
import { IOrderDocument } from "../../database/models/OrderModel";

export default ((server: FastifyInstance, options: FastifyPluginOptions, next: (error?: FastifyError) => void) => {
    server.post("/", registerUser, async (request, reply) => {
        try {
            await userController.createUser(request.body as Partial<IUserDocument>);
            reply.send(handleSuccess("Registered user"));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { userID: IUserDocument["_id"]; action: string; };
        Body: {
            firstName: IUserDocument["firstName"];
            lastName: IUserDocument["lastName"];
            email: IUserDocument["email"];
            password: IUserDocument["password"];
            oldPassword: IUserDocument["password"];
            phone: IUserDocument["phone"];
        };
    }>("/:userID/:action", amendUser, async (request, reply) => {
        try {
            switch (request.params.action) {
                case "name": {
                    const response = await userController.updateName(
                      request.params.userID,
                      [request.body.firstName, request.body.lastName],
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                case "email": {
                    const response = await userController.updateEmail(
                      request.params.userID,
                      request.body.email,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                case "password": {
                    const response = await userController.updatePassword(
                      request.params.userID,
                      request.body.password,
                      request.body.oldPassword,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                case "phone": {
                    const response = await userController.updatePhone(
                      request.params.userID,
                      request.body.phone,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                default:
                    reply.callNotFound();
                    break;
            }
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.post<{
        Body: { email: IUserDocument["email"]; password: IUserDocument["password"]; };
    }>("/login", loginSchema, async (request, reply) => {
        try {
            const { token, payload } = await userController.login(request.body.email, request.body.password);

            reply.setCookie("token", token, {
                "domain": process.env.DOMAIN,
                "path": "/",
                "signed": true,
                "expires": new Date(Date.now() + 1.21e+9), // 2 weeks
                "httpOnly": true,
                "sameSite": true,
                "secure": process.env.NODE_ENV === "production"
            });

            reply.send(handleSuccess("Logged in", undefined, payload));
        } catch (err) {
            const response = handleError(err, 401);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get("/byToken", async (request, reply) => {
        try {
            const updatedUser = await userController.getUser(reply.unsignCookie(request.cookies.token) as string, {
                decryptEmail: true,
                decryptPhone: true
            });
            reply.send(handleSuccess("Got updated user", undefined, updatedUser));
        } catch (err) {
            const response = handleError(err, 401);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get("/updatedUserFromLogin", async (request, reply) => {
        try {
            const updatedUser = await userController.getUser(reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("Got updated user from login token", undefined, {
                "fullName": `${updatedUser.firstName} ${updatedUser.lastName}`,
                "admin": updatedUser.admin,
                "userID": updatedUser._id,
                "avatar": updatedUser.avatar
            }));
        } catch (err) {
            const response = handleError(err, 401);
            reply.status(response.statusCode).send(response);
        }
    });

    server.delete<{
        Params: { userID: IUserDocument["_id"]; };
    }>("/:userID", deleteSchema, async (request, reply) => {
        try {
            const response = await userController.deleteUser(
              request.params.userID,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.put<{
        Params: { userID: IUserDocument["_id"]; }; Body: { items: IUserDocument["items"]; };
    }>("/:userID/items", updateItemsSchema, async (request, reply) => {
        try {
            const response = await userController.updateItems(
              request.params.userID,
              request.body.items,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get<{
        Params: { userID: IUserDocument["_id"]; };
    }>("/:userID/history", getUserItemsHistorySchema, async (request, reply) => {
        try {
            const response = await userController.viewHistory(request.params.userID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("OK", 200, response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.delete<{
        Params: { userID: IUserDocument["_id"]; };
    }>("/:userID/items", resetUserItemsSchema, async (request, reply) => {
        try {
            const response = await userController.resetItems(request.params.userID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get("/logout", {}, async (request, reply) => {
        try {
            reply.clearCookie("token");
            reply.send(handleSuccess("Logged out"));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get<{
        Params: { userID: IUserDocument["_id"] }
    }>("/order/:userID", async (request, reply) => {
        try {
            const data = await userController.getOrder(request.params.userID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("Here's your order! :)", undefined, data));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get<{
        Headers: { "x-order-token": string }
    }>("/order/token", async (request, reply) => {
        try {
            const data = await userController.getTokenOrder(request.headers["x-order-token"], reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("Got order by token", undefined, data));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get<{
        Headers: { "x-order-token": string }
    }>("/order/register/token", async (request, reply) => {
        try {
            const data = await userController.registerOrder(request.headers["x-order-token"], reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("Registered order", undefined, data));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    // @ts-ignore
    server.get("/orders", { websocket: true }, async (connection: any, request: any) => {
        connection.socket.on('message', (message: string) => {
            // @ts-ignore
            server.websocketServer.clients.forEach((client) => {
                if (client !== connection.socket && client.readyState === 1) client.send(message);
            })
        })
    });

    server.delete<{
        Params: { orderID: IOrderDocument["_id"] }
    }>("/order/:orderID", async (request, reply) => {
        try {
            const response = await userController.completeOrder(request.params.orderID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess(response, undefined));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    next();
});
