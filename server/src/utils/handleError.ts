export const handleSuccess = (message: string, statusCode = 200, data: any = {}) => ({
    "error": false,
    statusCode,
    message,
    data
});
export const generateErrorMessage = (message: string, statusCode = 400) => ({ message, statusCode, "error": true });

export default (err: string | Error, statusCode = 500) => {
    console.error(err);

    switch (err.toString()) {
        default:
            return generateErrorMessage(err.toString(), statusCode);
    }
};
