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

    // server.patch("/:userID/:action", {}, async (request, reply) => {
    //     const response = await userController.amend(request.params.userID as IUser["_id"], request.params.action, "");
    // })

    server.post("/login", loginSchema, async (request:Omit<FastifyRequest, 'body'> & { body: RequestBody }, reply) =>{
        const  response = await userController.login(request.body.email as string, request.body.password as string);
        return reply.status(response.statusCode).send(response);
    });

    next();
});
