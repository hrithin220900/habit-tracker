import { Router } from "express";
import { habitsController } from "./habits.controller.js";
import { validate } from "../../core/middlewares/validation.middleware.js";
import {
  createHabitSchema,
  updateHabitSchema,
  completeHabitSchema,
  getPublicHabitSchema,
} from "./habits.validators.js";
import { authenticate } from "../../core/middlewares/auth.middleware.js";

/**
 * Habits routes
 */
const router = Router();

/**
 * @route   POST /api/habits
 * @desc    Create a new habit
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validate(createHabitSchema, "body"),
  habitsController.create.bind(habitsController)
);

/**
 * @route   GET /api/habits
 * @desc    Get all habits for authenticated user
 * @access  Private
 */
router.get("/", authenticate, habitsController.getAll.bind(habitsController));

/**
 * @route   GET /api/habits/:id
 * @desc    Get habit by ID
 * @access  Private
 */
router.get(
  "/:id",
  authenticate,
  habitsController.getById.bind(habitsController)
);

/**
 * @route   PUT /api/habits/:id
 * @desc    Update habit
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  validate(updateHabitSchema, "body"),
  habitsController.update.bind(habitsController)
);

/**
 * @route   DELETE /api/habits/:id
 * @desc    Delete habit
 * @access  Private
 */
router.delete(
  "/:id",
  authenticate,
  habitsController.delete.bind(habitsController)
);

/**
 * @route   POST /api/habits/:id/complete
 * @desc    Mark habit as complete for a date
 * @access  Private
 */
router.post(
  "/:id/complete",
  authenticate,
  validate(completeHabitSchema, "body"),
  habitsController.markComplete.bind(habitsController)
);

/**
 * @route   GET /api/habits/public/:publicId
 * @desc    Get public habit by public ID
 * @access  Public
 */
router.get(
  "/public/:publicId",
  validate(getPublicHabitSchema, "params"),
  habitsController.getPublic.bind(habitsController)
);

export default router;
