import { User, type IUserDocument } from "../users/users.model.js";
import { ConflictError, NotFoundError } from "../../core/utils/errors.js";
import { logger } from "../../core/utils/logger.js";

export class AuthRepository {
  async findByEmail(
    email: string,
    includePassword: boolean = false
  ): Promise<IUserDocument | null> {
    try {
      const query = User.findOne({ email: email.toLowerCase() });
      if (includePassword) {
        query.select("+password +refreshToken +refreshTokenExpiry");
      }
      return await query.exec();
    } catch (error) {
      logger.error({ error, email }, "Error finding user by email");
      throw error;
    }
  }

  async findById(
    userId: string,
    includePassword = false
  ): Promise<IUserDocument | null> {
    try {
      const query = User.findById(userId);
      if (includePassword) {
        query.select("+password +refreshToken +refreshTokenExpiry");
      }
      return await query.exec();
    } catch (error) {
      logger.error({ error, userId }, "Error finding user by ID");
      throw error;
    }
  }

  async create(userData: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<IUserDocument> {
    try {
      const existinUser = await this.findByEmail(userData.email);
      if (existinUser) {
        throw new ConflictError("User already exists");
      }
      const user = new User({
        email: userData.email.toLowerCase(),
        password: userData.password,
        name: userData.name.trim(),
        role: userData.role || "user",
      });
      return await user.save();
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      logger.error({ error, email: userData.email }, "Error creating user");
      throw error;
    }
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
    expiryDate: Date | null
  ): Promise<IUserDocument> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          refreshToken,
          refreshTokenExpiry: expiryDate,
        },
        { new: true, runValidators: true }
      ).select("+refreshToken +refreshTokenExpiry");

      if (!user) {
        throw new NotFoundError("User");
      }

      return user;
    } catch (error) {
      logger.error({ error, userId }, "Error updating refresh token");
      throw error;
    }
  }

  async clearRefreshToken(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1, refreshTokenExpiry: 1 },
      });
    } catch (error) {
      logger.error({ error, userId }, "Error clearing refresh token");
      throw error;
    }
  }
}

export const authRepository = new AuthRepository();
