import  { FastifyInstance, FastifyPluginOptions, FastifyError } from "fastify";
import * as userController from "./user-ctrl";
import { IUser } from "../../database/models/UserModel";
import { loginSchema, registerUser } from "./user-route-schema";
import handleError, { handleSuccess } from "../../utils/handleError";

export default ((server: FastifyInstance, options: FastifyPluginOptions, next: (error?: FastifyError) => void) => {
    server.post("/", registerUser, async (request, reply) => {
        try {
            await userController.createUser(request.body as Partial<IUser>);
            reply.send(handleSuccess("Registered user"));
        }  catch (err) {
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
    }>("/:userID/:action", {}, async (request, reply) => {
        try {
            switch(request.params.action) {
                case "name": {
                    const response = await userController.updateName(
                      request.params.userID,
                      [request.body.firstName, request.body.lastName],
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                    const response = await userController.updateEmail(
                      request.params.userID,
                      request.body.email,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response))
                    return;
                }
                case "password": {
                    const response = await userController.updatePassword(
                      request.params.userID,
                      request.body.password,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response))
                    return;
                }
                case "phone": {
                    const response = await userController.updatePhone(
                      request.params.userID,
                      request.body.phone,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response))
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


    server.post("/login", loginSchema, async (request:Omit<FastifyRequest, 'body'> & { body: RequestBody }, reply) =>{
        const  response = await userController.login(request.body.email as string, request.body.password as string);
        return reply.status(response.statusCode).send(response);
    });

    next();
});
