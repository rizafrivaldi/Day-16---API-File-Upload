require("dotenv").config();
const express = require("express");
const path = require("path");

const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
app.use(express.json());

app.unsubscribe("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

module.exports = app;
