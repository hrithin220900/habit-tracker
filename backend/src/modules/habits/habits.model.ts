import mongoose, { Schema, Model } from "mongoose";
import crypto from "crypto";
import type { IHabit } from "../../shared/types/index.js";

export interface IHabitDocument
  extends Omit<IHabit, "_id" | "userId">,
    mongoose.Document {
  userId: mongoose.Types.ObjectId;
  generatePublicId(): string;
}

const habitSchema = new Schema<IHabitDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Habit name is required"],
      trim: true,
      maxlength: [100, "Habit name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "custom"],
      default: "daily",
      required: true,
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"],
      default: "#3B82F6",
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
      trim: true,
      maxlength: [50, "Icon name cannot exceed 50 characters"],
      default: "star",
    },
    reminderTime: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    publicId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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

habitSchema.index({ userId: 1, createdAt: -1 }); // User's habits sorted by creation
habitSchema.index({ publicId: 1 }, { unique: true, sparse: true });
habitSchema.index({ isPublic: 1, createdAt: -1 }); // Public habits

habitSchema.index({ userId: 1, name: 1 });

habitSchema.pre("save", async function () {
  // Generate publicId if habit is public and doesn't have one
  if (this.isPublic && !this.publicId) {
    this.publicId = this.generatePublicId();
  }

  // Remove publicId if habit is made private
  if (!this.isPublic && this.publicId) {
    this.publicId = undefined;
  }
});

habitSchema.methods.generatePublicId = function (): string {
  return crypto.randomBytes(8).toString("hex");
};

habitSchema.virtual("completionCount", {
  ref: "HabitCompletion",
  localField: "_id",
  foreignField: "habitId",
  count: true,
});

export const Habit: Model<IHabitDocument> = mongoose.model<IHabitDocument>(
  "Habit",
  habitSchema
);
