const credentialsBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "test@mail.com" },
          password: { type: "string", example: "123456" },
        },
      },
    },
  },
};

export const openapi = {
  openapi: "3.0.3",
  info: { title: "Order Tracking API", version: "1.0.0" },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        requestBody: credentialsBody,
        responses: { "201": { description: "Created" }, "409": { description: "Email exists" } },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        requestBody: credentialsBody,
        responses: { "200": { description: "JWT token" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Current user" }, "401": { description: "Unauthorized" } },
      },
    },
  },
};
