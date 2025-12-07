require("dotenv").config();
const express = require("express");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
app.use(express.json());

//serve file static (can be accessed directly via URL)
app.use("/uploads", express.static("uploads"));

//routes
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
