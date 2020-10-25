import { FastifyError, FastifyInstance, FastifyPluginOptions } from "fastify";
import * as itemController from "./item-ctrl";
import handleError, { handleSuccess } from "../../utils/handleError";
import {
    createCategorySchema, createItemSchema,
    deleteCategorySchema,
    editCategoryNameSchema, editItemPropertiesSchema,
    getCategorySchema, updateItemStockSchema
} from "./item-route-schema";
import { ICategory } from "../../database/models/CategoryModel";
import { IItem } from "../../database/models/ItemModel";

export default ((server: FastifyInstance, options: FastifyPluginOptions, next: (error?: FastifyError) => void) => {
    server.post<{ Body: { name: string }; }>("/", createCategorySchema, async (request, reply) => {
        try {
            const response = await itemController.createCategory(
              request.body.name,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get("/", {}, async (request, reply) => {
        try {
            const response = await itemController.getCategories(reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("OK", 200, response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.get<{
        Params: { categoryID: ICategory["_id"]; };
    }>("/:categoryID", getCategorySchema, async (request, reply) => {
        try {
            const response = await itemController.getCategory(request.params.categoryID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess("OK", 200, response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { category: ICategory["_id"]; };
        Body: { name: string; };
    }>("/:category", editCategoryNameSchema, async (request, reply) => {
        try {
            const response = await itemController.editCategoryName(
              request.params.category,
              request.body.name,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.delete<{
        Params: { categoryID: ICategory["_id"]; };
    }>("/:categoryID", deleteCategorySchema, async (request, reply) => {
        try {
            const response = await itemController.deleteCategory(request.params.categoryID, reply.unsignCookie(request.cookies.token) as string);
            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.post<{
        Params: { category: ICategory["_id"]; };
        Body: { name: string; image: string; };
    }>("/:category", createItemSchema, async (request, reply) => {
        try {
            const response = await itemController.createItem(
              request.params.category,
              request.body.name,
              request.body.image,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.patch<{
        Params: { category: ICategory["_id"]; item: IItem["_id"]; action: string; };
        Body: { name: string; image: string; stock: IItem["stock"] };
    }>("/:category/:item/:action", editItemPropertiesSchema, async (request, reply) => {
        try {
            switch (request.params.action) {
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
                case "stock": {
                    const response = await itemController.updateItemStock(
                      request.params.item,
                      request.body.stock,
                      reply.unsignCookie(request.cookies.token) as string
                    );

                    reply.send(handleSuccess(response));
                    return;
                }
                default:
                    reply.callNotFound();
                    return;
            }
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.delete<{
        Params: { category: ICategory["_id"]; item: IItem["_id"]; };
    }>("/:category/:item", deleteItemSchema, async (request, reply) => {
        try {
            const response = await itemController.deleteItem(
              request.params.item,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    server.put<{
        Params: { category: ICategory["_id"]; item: IItem["_id"]; };
        Body: { category: string };
    }>("/:category/:item", updateItemStockSchema, async (request, reply) => {
        try {
            const response = await itemController.moveItem(
              request.params.item,
              request.body.category,
              reply.unsignCookie(request.cookies.token) as string
            );

            reply.send(handleSuccess(response));
        } catch (err) {
            const response = handleError(err);
            reply.status(response.statusCode).send(response);
        }
    });

    next();
});
