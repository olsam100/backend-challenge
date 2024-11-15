import express from 'express'
import {
  signup,
  verifyEmail,
  login,
  verifyMfa,
  getProfile,
  updateProfile,
} from '../controllers/users'
import { auth } from '../middleware/auth'

const router = express.Router()

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user with an email and password. Upon successful registration, an MFA code is sent to the user's email for verification.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully. MFA code sent to email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully. MFA code sent to email."
 *                 mfaRequired:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid input, user already exists, or other signup error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Email already in use"
 */
router.post('/signup', signup)

/**
 * @swagger
 * /user/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     description: Verifies a user's email address using a token sent via email.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token sent to the user's email
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account verified successfully"
 *       400:
 *         description: Invalid or expired verification link
 */

router.get('/verify/:token', verifyEmail)

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     description: Login a user and return a JWT token. If MFA is enabled, an MFA code is required.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login)

/**
 * @swagger
 * /user/verify-mfa:
 *   post:
 *     summary: Verify MFA code
 *     description: Verifies the MFA code sent to the user’s email.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               mfaSecret:
 *                 type: string
 *             required:
 *               - email
 *               - mfaSecret
 *     responses:
 *       200:
 *         description: MFA verified, login successful
 *       400:
 *         description: MFA is not enabled or code is invalid
 *       401:
 *         description: Invalid or expired MFA code
 */
router.post('/verify-mfa', verifyMfa)

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 *       404:
 *         description: User not found
 */
router.get('/profile', auth, getProfile)

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */
router.put('/profile', auth, updateProfile)

export default router
