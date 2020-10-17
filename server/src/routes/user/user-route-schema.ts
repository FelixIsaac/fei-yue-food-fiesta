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

export const loginSchema = {
    "schema": {
        "body": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
                "email": { "type": "string" },
                "password": { "type": "string" }
            }
        }
    }
};
