const prisma = require("../config/prisma");
const cloudinaryService = require("./cloudinary.service");

exports.uploadSingle = async (file, userId) => {
  if (!file) {
    throw { status: 400, message: "No file uploaded" };
  }

  return prisma.image.create({
    data: {
      publicId: file.pulic_id,
      url: file.secure_url,
      mimetype: file.mimetype,
      size: file.bytes,
      userId,
    },
  });
};

exports.uploadMultiple = async (Files, userId) => {
  if (!files || files.length === 0) {
    throw { status: 400, message: "No files uploaded" };
  }

  const images = files.map((file) => ({
    publicId: file.public_id,
    url: file.secure_url,
    mimetype: file.mimetype,
    size: file.bytes,
    userId,
  }));

  const result = await prisma.image.createMany({
    data: ImageTrackList,
    skipDuplicates: true,
  });

  return { count: result.count, images };
};

exports.deleteImage = async (id, userId) => {
  const image = await prisma.image.findUnique({ where: id });
  if (!image) throw { status: 404, message: "file not found" };
  if (image.userId !== userId) throw { status: 403, message: "Forbidden" };

  await cloudinaryService.destroy(image.publicId);
  await prisma.image.delete({ where: { id } });

  return image;
};
