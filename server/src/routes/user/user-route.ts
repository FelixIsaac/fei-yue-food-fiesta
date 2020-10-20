import { FastifyError, FastifyInstance, FastifyPluginOptions } from "fastify";
import * as userController from "./user-ctrl";
import { IUser } from "../../database/models/UserModel";
import {
    amendUser,
    deleteSchema,
    getUserItemsHistorySchema,
    loginSchema,
    registerUser, resetUserItemsSchema,
    updateItemsSchema
} from "./user-route-schema";
import handleError, { handleSuccess } from "../../utils/handleError";

export default ((server: FastifyInstance, options: FastifyPluginOptions, next: (error?: FastifyError) => void) => {
    server.post("/", registerUser, async (request, reply) => {
        try {
            await userController.createUser(request.body as Partial<IUser>);
            reply.send(handleSuccess("Registered user"));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { userID: IUser["_id"]; action: string; };
        Body: {
            firstName: IUser["firstName"];
            lastName: IUser["lastName"];
            email: IUser["email"];
            password: IUser["password"];
            phone: IUser["phone"];
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
        Body: { email: IUser["email"]; password: IUser["password"]; };
    }>("/login", loginSchema, async (request, reply) => {
        try {
            reply.setCookie("token", await userController.login(request.body.email, request.body.password), {
                "domain": process.env.DOMAIN,
                "path": "/",
                "signed": true,
                "expires": new Date(Date.now() + 1.21e+9), // 2 weeks
                "sameSite": true,
                "secure": process.env.NODE_ENV === "production"
            });

            reply.send(handleSuccess("Logged in"));
        } catch (err) {
            const response = handleError(err, 401);
            reply.status(response.statusCode).send(response);
        }
    });

    server.delete<{
        Params: { userID: IUser["_id"]; };
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
        Params: { userID: IUser["_id"]; }; Body: { items: IUser["items"]; };
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
        Params: { userID: IUser["_id"]; };
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
        Params: { userID: IUser["_id"]; };
    }>("/:userID/items", resetUserItemsSchema, async (request, reply) => {
       try {
           const response = await userController.resetItems(request.params.userID, reply.unsignCookie(request.cookies.token) as string);
           reply.send(handleSuccess(response));
       } catch (err) {
           const response = handleError(err);
           reply.status(response.statusCode).send(response);
       }
    });

    server.get("/", {}, async (request, reply) => {
       try {
           const response = await userController.getUser(reply.unsignCookie(request.cookies.token) as string);
           reply.send(handleSuccess("OK", undefined, response));
       }  catch (err) {
           const response = handleError(err);
           reply.status(response.statusCode).send(response);
       }
    });

    next();
});
