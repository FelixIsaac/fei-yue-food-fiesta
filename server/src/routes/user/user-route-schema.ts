// ,
// "response": {
//     200: {
//         "type": "object",
//           "required": ["error", "statusCode", "message"],
//           "properties": {
//             "error": { "type": "boolean" },
//             "statusCode": { "type": "number" },
//             "message": { "type": "string" },
//             "data": { "type": "object" }
//         }
//     },
//     "2xx": {
//         "type": "object",
//           "required": ["error", "statusCode", "message"],
//           "properties": {
//             "error": { "type": "boolean" },
//             "statusCode": { "type": "number" },
//             "message": { "type": "string" }
//         }
//     },
//     "4xx": {
//         "type": "object",
//           "required": ["error", "statusCode", "message"],
//           "properties": {
//             "error": { "type": "boolean" },
//             "statusCode": { "type": "number" },
//             "message": { "type": "string" }
//         }
//     },
//     "5xx": {
//         "type": "object",
//           "required": ["error", "statusCode", "message"],
//           "properties": {
//             "error": { "type": "boolean" },
//             "statusCode": { "type": "number" },
//             "message": { "type": "string" }
//         }
//     }
// }
// }

export const registerUser = {
    "schema": {
        "body": {
            "type": "object",
            "required": ["email", "password", "phone"],
            "additionalProperties": false,
            "properties": {
                "firstName": { "type": "string" },
                "lastName": { "type": "string" },
                "email": { "type": "string", "format": "email" },
                "phone": { "type": "string" },
                "password": { "type": "string" }
            }
        }
    }
};

export const amendUser = {
    "schema": {
        "body": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "firstName": { "type": "string" },
                "lastName": { "type": "string" },
                "email": { "type": "string", "format": "email" },
                "phone": { "type": "string" },
                "password": { "type": "string" },
                "oldPassword": { "type": "string" }
            }
        },
        "params": {
            "type": "object",
            "required": ["userID", "action"],
            "properties": {
                "userID": { "type": "string" },
                "action": { "type": "string" }
            }
        }
    }
}

export const loginSchema = {
    "schema": {
        "body": {
            "type": "object",
            "required": ["email", "password"],
            "additionalProperties": false,
            "properties": {
                "email": { "type": "string" },
                "password": { "type": "string" }
            }
        }
    }
};

export const deleteSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "userID": { "type": "string" }
            }
        }
    }
};

export const updateItemsSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "userID": { "type": "string" }
            }
        },
        "body": {
            "additionalProperties": false,
            "required": ["items"],
            "properties": {
                "items": { "type": "array" }
            }
        }
    }
};

export const getUserItemsHistorySchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "userID": { "type": "string" }
            }
        }
    }
};

export const resetUserItemsSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "userID": { "type": "string" }
            }
        }
    }
}
