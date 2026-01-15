const swaggerJSDoc = require("swagger-jsdoc");

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API File Upload",
      version: "1.0.0",
      description: "Auth & File Upload API",
    },
    servers: [
      {
        url: "http://localhost:5001",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [], //define manual
});

swaggerSpec.paths = {
  "/api/auth/register": {
    post: {
      summary: "Register user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "password"],
              properties: {
                username: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "User registered" },
        400: { description: "Bad request" },
      },
    },
  },

  "/api/auth/login": {
    post: {
      summary: "Login user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Login success" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/uploads/single": {
    post: {
      summary: "Upload single file",
      tags: ["Upload"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["file"],
              properties: {
                file: {
                  type: "string",
                  format: "binary",
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "File uploaded" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/uploads/multiple": {
    post: {
      summary: "Upload multiple files",
      tags: ["Upload"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: ["files"],
              properties: {
                files: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Files uploaded" },
      },
    },
  },

  "/api/uploads": {
    get: {
      summary: "Get all uploads",
      tags: ["Upload"],
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: "page", in: "query", schema: { type: "number" } },
        { name: "limit", in: "query", schema: { type: "number" } },
      ],
      responses: {
        200: { description: "Success" },
        401: { description: "Unauthorized" },
      },
    },
  },
};

module.exports = swaggerSpec;
