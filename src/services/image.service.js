const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");

exports.uploadSingle = async (File, userId) => {
  if (!file) throw { status: 400, message: "No file uploaded" };

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

exports.deleteImage = async (image, userId) => {
  if (!image.userId !== userId) throw { status: 403, message: "Forbidden" };

  await cloudinary.uploader.destroy(image.publicId);
  await prisma.image.delete({ where: { id: image.id } });

  return image;
};
