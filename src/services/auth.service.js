const prisma = require("../../prisma/prisma");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/token");

exports.register = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw { status: 400, message: "All fields are required" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw { status: 409, message: "Email already registered" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  };
};

exports.login = async ({ email, password }) => {
    id (!email || !password) {
        throw { status: 400, message: "Email & password are required" };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw { status: 401, message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { status: 401, message: "Invalid email or password" };
    }

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    return {
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    };
};