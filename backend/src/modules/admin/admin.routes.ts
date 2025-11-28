import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { validate } from "../../core/middlewares/validation.middleware.js";
import {
  getUsersSchema,
  getHabitsSchema,
  updateUserRoleSchema,
  deleteUserSchema,
} from "./admin.validators.js";
import {
  authenticate,
  authorize,
} from "../../core/middlewares/auth.middleware.js";

/**
 * Admin routes - all routes require admin role
 */
const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Admin only
 */
router.get(
  "/users",
  validate(getUsersSchema, "query"),
  adminController.getUsers.bind(adminController)
);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get user by ID with statistics
 * @access  Admin only
 */
router.get("/users/:userId", adminController.getUserById.bind(adminController));

/**
 * @route   PUT /api/admin/users/:userId/role
 * @desc    Update user role
 * @access  Admin only
 */
router.put(
  "/users/:userId/role",
  validate(updateUserRoleSchema, "body"),
  adminController.updateUserRole.bind(adminController)
);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user
 * @access  Admin only
 */
router.delete(
  "/users/:userId",
  validate(deleteUserSchema, "params"),
  adminController.deleteUser.bind(adminController)
);

/**
 * @route   GET /api/admin/habits
 * @desc    Get all habits with pagination
 * @access  Admin only
 */
router.get(
  "/habits",
  validate(getHabitsSchema, "query"),
  adminController.getHabits.bind(adminController)
);

/**
 * @route   GET /api/admin/metrics
 * @desc    Get system metrics
 * @access  Admin only
 */
router.get("/metrics", adminController.getMetrics.bind(adminController));

export default router;
