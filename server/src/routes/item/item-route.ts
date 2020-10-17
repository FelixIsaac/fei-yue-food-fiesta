import  { FastifyInstance, FastifyPluginOptions, FastifyError } from "fastify";
import * as itemController from "./item-ctrl";
import handleError, { handleSuccess } from "../../utils/handleError";
import { ICategory, IItem } from "../../database/models/CategoryModel";

export default ((server: FastifyInstance, options: FastifyPluginOptions, next: (error?: FastifyError) => void) => {
    server.post<{ Body: { name: string}; }>("/", {}, async (request, reply) => {
        try {
            const response = await itemController.createCategory(
              request.body.name,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        }  catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { category: ICategory["_id"]; };
        Body: { name: string; };
    }>("/:category", {}, async (request, reply) => {
        try {
            const response = await itemController.editCategoryName(
              request.params.category,
              request.body.name,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        }  catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.post<{
        Params: { category: ICategory["_id"]; };
        Body: { name: string; image: string; };
    }>("/:category", {}, async (request, reply) => {
        try {
            const response = await itemController.createItem(
              request.params.category,
              request.body.name,
              request.body.image,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        }  catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { category: ICategory["_id"]; item: IItem["_id"]; action: string; };
        Body: { name: string; image: string; };
    }>("/:category/:item/:action", {}, async (request, reply) => {
        try {
            switch(request.params.action) {
                case "name": {
                    const response = await itemController.editItemName(
                      request.params.item,
                      request.body.name,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                case "image": {
                    const response = await itemController.editItemImage(
                      request.params.item,
                      request.body.image,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                default:
                    reply.callNotFound();
                    return;
            }
        }  catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });
