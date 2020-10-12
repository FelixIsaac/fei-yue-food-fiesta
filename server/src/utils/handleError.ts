import { CastError } from "mongoose";

export const handleSuccess = (message: string, status = 200) => ({
    "error": false,
    status, message
});

export const generateErrorMessage = (message: string, status = 400) => ({ message, status, "error": true  }) ;

export default (err: string | Error) => {
    console.error(err);

    if (err instanceof CastError) {

    }
};
