const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: rivaldi
 *               email:
 *                 type: string
 *                 example: rivaldi@mail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login success
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authController.login);

module.exports = router;
