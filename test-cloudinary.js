require("dotenv").config();
const cloudinary = require("./src/config/cloudinary"); // sesuaikan path

console.log("🔍 Testing Cloudinary Configuration...\n");

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log(
  "API Secret:",
  process.env.CLOUDINARY_API_SECRET ? "✅ EXISTS" : "❌ MISSING",
);

console.log("\n📤 Testing image upload...");

// Upload test image dari URL
cloudinary.uploader
  .upload("https://picsum.photos/200", {
    folder: "test",
    public_id: "test_image",
  })
  .then((result) => {
    console.log("\n✅ SUCCESS! Cloudinary is working!");
    console.log("Image URL:", result.secure_url);
    console.log("Public ID:", result.public_id);
  })
  .catch((err) => {
    console.log("\n❌ CLOUDINARY ERROR:");
    console.log("Error Name:", err.name);
    console.log("Error Message:", err.message);
    console.log("\nFull Error:", err);
  });
