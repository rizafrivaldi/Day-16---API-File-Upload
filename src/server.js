require("dotenv").config();
const express = require("express");
const path = require("path");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.use(express.json());

//serve file static (can be accessed directly via URL)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//routes
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
