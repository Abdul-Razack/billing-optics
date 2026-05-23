import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { AppError } from '../utils/errors';
import env from '../config/env';
import { LoginPayload as LoginDTO, RegisterPayload as RegisterDTO, AuthResponse } from '../types/auth.types';

export class UnauthorizedError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'User account is inactive') {
    super(403, message);
  }
}

export class AuthService {
  async login(data: LoginDTO): Promise<AuthResponse> {
    const result = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    const user = result[0];

    if (!user) {
      throw new UnauthorizedError();
    }

    if (!user.isActive) {
      throw new ForbiddenError();
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError();
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: String(user.id),
        name: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(data: RegisterDTO): Promise<Omit<typeof users.$inferSelect, 'passwordHash'>> {
    return await db.transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const [insertedUser] = await tx.insert(users).values({
        fullName: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role as any,
        isActive: true,
      }).returning();

      const { passwordHash, ...userWithoutPassword } = insertedUser;
      return userWithoutPassword;
    });
  }
}

export const authService = new AuthService();

