const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

exports.createSingle = async (file, userId) => {
  return prisma.image.create({
    data: {
      publicId: file.public_id,
      url: file.secure_url,
      mimetype: file.mimetype,
      size: file.bytes,
      userId,
    },
  });
};
