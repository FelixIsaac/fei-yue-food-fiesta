export const handleSuccess = (message: string, statusCode = 200) => ({ "error": false, statusCode, message });
export const generateErrorMessage = (message: string, statusCode = 400) => ({ message, statusCode, "error": true  });

export default (err: string | Error) => {
    console.error(err);

    switch(err.toString()) {
        default:
            return generateErrorMessage(err.toString(), 500);
    }
};
