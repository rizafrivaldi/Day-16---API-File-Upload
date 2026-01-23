const prisma = require("../config/prisma");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");

exports.createSingle = async (file, userId) => {
  return prisma.image.create({
    data: {
      publicId: file.filename,
      url: file.path,
      mimetype: file.mimetype,
      size: file.size,
      userId,
    },
  });
};

exports.createMultiple = async (files, userId) => {
  const images = files.map((file) => ({
    publicId: file.filename,
    url: file.path,
    mimetype: file.mimetype,
    size: file.size,
    userId,
  }));

  const result = await prisma.image.createMany({
    data: images,
    skipDuplicates: true,
  });

  return { images, count: result.count };
};

exports.getAll = async ({ userId, page, limit, search, sortBy, order }) => {
  const where = {
    userId,
    publicId: { contains: search },
  };

  const [total, images] = await Promise.all([
    prisma.image.count({ where }),
    prisma.image.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
  ]);

  return {
    images,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.getById = async (id, userId) => {
  return prisma.image.findFirst({
    where: { id, userId },
  });
};

exports.adminAll = async () => {
  return prisma.image.findMany({
    include: {
      user: {
        select: { id: true, username: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.reupload = async (id, file, userId) => {
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return null;
  if (image.userId !== userId) throw new AppError("Forbidden", 403);

  await cloudinary.uploader.destroy(image.publicId);

  return prisma.image.update({
    where: { id },
    data: {
      publicId: file.filename,
      url: file.path,
      mimetype: file.mimetype,
      size: file.size,
    },
  });
};

exports.remove = async (id, userId) => {
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return null;
  if (image.userId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  await cloudinary.uploader.destroy(image.publicId);
  await prisma.image.delete({ where: { id } });

  return image;
};
