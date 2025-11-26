import mongoose, { Schema, Model } from "mongoose";
import type { IHabitCompletion } from "../../shared/types/index.js";

export interface IHabitCompletionDocument
  extends Omit<IHabitCompletion, "_id" | "habitId" | "userId">,
    mongoose.Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const validateDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
};

const habitCompletionSchema = new Schema<IHabitCompletionDocument>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: [true, "Habit ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    completedAt: {
      type: Date,
      required: [true, "Completion timestamp is required"],
      default: Date.now,
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
      validate: {
        validator: validateDateFormat,
        message: "Date must be in YYYY-MM-DD format",
      },
      index: true,
    },
    streak: {
      type: Number,
      required: [true, "Streak is required"],
      min: [0, "Streak cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

habitCompletionSchema.index({ userId: 1, date: -1 });

habitCompletionSchema.index({ habitId: 1, date: -1 });

habitCompletionSchema.index(
  { habitId: 1, userId: 1, date: 1 },
  { unique: true }
);

habitCompletionSchema.index({ habitId: 1, userId: 1, date: 1 });

habitCompletionSchema.pre("save", function () {
  if (this.date && !validateDateFormat(this.date)) {
    const dateObj = new Date(this.completedAt);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    this.date = `${year}-${month}-${day}`;
  }
});

habitCompletionSchema.statics.getTodayDateString = function (): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const HabitCompletion: Model<IHabitCompletionDocument> =
  mongoose.model<IHabitCompletionDocument>(
    "HabitCompletion",
    habitCompletionSchema
  );
