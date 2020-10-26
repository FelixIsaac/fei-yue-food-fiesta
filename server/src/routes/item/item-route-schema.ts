export const createCategorySchema = {
    "schema": {
        "body": {
            "type": "object",
            "required": ["name"],
            "properties": {
                "name": { "type":  "string" }
            }
        }
    }
}

export const getCategorySchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "categoryID": { "type": "string" }
            }
        }
    }
}

export const editCategoryNameSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "categoryID": { "type": "string" }
            }
        },
        "body": {
            "type": "object",
            "properties": {
                "name": { "type": "string" }
            }
        }
    }
}

export const deleteCategorySchema = {
    "schema": {
        "params": {
            "types": "object",
            "properties": {
                "categoryID": { "type": "string" }
            }
        }
    }
};

export const createItemSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "category": { "type": "string" }
            }
        },
        "body": {
            "type": "object",
            "required": ["name", "image"],
            "properties": {
                "name": { "type": "string" },
                "image": { "type": "string" }
            }
        }
    }
}

export const editItemPropertiesSchema = {
    "schema": {
        "params": {
            "type": "object",
            "required": ["category", "item", "action"],
            "properties": {
                "category": { "type": "string" },
                "item": { "type": "string" },
                "action": { "type": "string" }
            }
        },
        "body": {
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "image": { "type": "string" },
                "stock": { "type": "number" }
            }
        }
    }
};

export const updateItemStockSchema = {
    "schema": {
        "params": {
            "type": "object",
            "properties": {
                "category": { "type": "string" },
                "item": { "type": "string" }
            }
        },
        "body": {
            "type": "object",
            "required": ["category"],
            "properties": {
                "category": { "type": "string" }
            }
        }
    }
}

export const deleteItemSchema = {

}
