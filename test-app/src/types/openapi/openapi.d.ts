export interface paths {
    "/headers-test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/spec-session/auth-test": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/spec-session/start-session": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        password?: string;
                    };
                };
            };
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                    };
                };
            };
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        trace?: never;
    };
    "/user/update-put": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                    };
                };
            };
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users": {
        parameters: {
            query?: {
                /** @description search */
                search?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    /** @description search */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"][];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: {
                    /** @description search */
                    search?: string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                        /** Format: bigint */
                        id?: string | number;
                    };
                };
            };
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["User"];
                    };
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                    };
                };
            };
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        trace?: never;
    };
    "/users/{id}/update-put": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        get?: never;
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: {
                content: {
                    "application/json": {
                        email?: string | null;
                    };
                };
            };
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/posts": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Created */
                201: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/users/{userId}/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
                id: string;
            };
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        put?: never;
        post?: never;
        delete: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        options?: never;
        head?: never;
        patch: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    userId: string;
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description Success, no content */
                204: components["responses"]["NoContent"];
                400: components["responses"]["BadRequest"];
                401: components["responses"]["Unauthorized"];
                403: components["responses"]["Forbidden"];
                404: components["responses"]["NotFound"];
                409: components["responses"]["Conflict"];
                422: components["responses"]["ValidationErrors"];
                500: components["responses"]["InternalServerError"];
            };
        };
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        User: {
            email: string | null;
            id: string;
        };
        ValidationErrors: {
            errors?: {
                [key: string]: string[];
            };
        };
    };
    responses: {
        /** @description The request has succeeded, but there is no content to render */
        NoContent: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The server would not process the request due to something the server considered to be a client error */
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ValidationErrors"];
            };
        };
        /** @description The request was not successful because it lacks valid authentication credentials for the requested resource */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description Understood the request, but refused to process it */
        Forbidden: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The specified resource was not found */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The request failed because a conflict was detected with the given request params */
        Conflict: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
        /** @description The request failed to process due to validation errors with the provided values */
        ValidationErrors: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ValidationErrors"];
            };
        };
        /** @description the server encountered an unexpected condition that prevented it from fulfilling the request */
        InternalServerError: {
            headers: {
                [name: string]: unknown;
            };
            content?: never;
        };
    };
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
