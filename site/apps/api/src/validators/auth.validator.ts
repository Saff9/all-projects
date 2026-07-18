import { z } from 'zod';

// Common validation patterns
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

// Register validation schema
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    fullName: fullNameSchema,
    phone: z.string().optional(),
    targetExam: z.enum(['NEET', 'JEE_MAIN', 'JEE_ADVANCED', 'BOTH']).optional(),
    targetYear: z.number().int().min(2024).max(2030).optional(),
  }),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// Change password validation schema (for authenticated users)
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    fullName: fullNameSchema.optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
    targetExam: z.enum(['NEET', 'JEE_MAIN', 'JEE_ADVANCED', 'BOTH']).optional(),
    targetYear: z.number().int().min(2024).max(2030).optional(),
    schoolName: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    preferredLanguage: z.enum(['en', 'hi']).optional(),
  }),
});

// Email verification validation schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>['body'];
