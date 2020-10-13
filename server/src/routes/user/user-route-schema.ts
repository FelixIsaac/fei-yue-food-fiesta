export const registerUser = {
    "schema": {
        "body": {
            "type": "object",
            "properties": {
                "firstName": { "type": "string" },
                "lastName": { "type": "string" },
                "email": { "type": "string", "format": "email" },
                "phone": { "type": "string" },
                "password": { "type": "string" }
            }
        },
        "required": ["email", "password", "phone"]
    }
}

export const loginSchema = {
    "schema": {
        "body": {
            "type": "object",
            "properties": {
                "email": { "type": "string" },
                "password": { "type": "string" }
            }
        },
        "required": ["email", "password"]
    }
}
