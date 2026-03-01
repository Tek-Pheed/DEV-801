import swaggerJSDoc, { Options } from "swagger-jsdoc";

const options: Options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "DEV-801 API",
            version: "1.0.0",
            description: "Documentation de l'api du projet DEV-801",
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["src/**/*.ts"],
};

export const swagger = swaggerJSDoc(options);
