const { z } = require('zod');

// Custom error messages
const emailSchema = z.string().trim().email({ message: 'Invalid email address format' });
const passwordSchema = z.string().min(6, { message: 'Password must be at least 6 characters long' });
const otpSchema = z.string().length(6, { message: 'OTP must be exactly 6 digits' }).regex(/^\d+$/, { message: 'OTP must contain digits only' });

const registerSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters long' }),
  email: emailSchema,
  phone: z.string().trim().min(10, { message: 'Phone number must be at least 10 characters long' }),
  password: passwordSchema
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  purpose: z.enum(['verification', 'reset'], { message: 'Purpose must be either verification or reset' })
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' })
});

const forgotPasswordSchema = z.object({
  email: emailSchema
});

const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
  newPassword: passwordSchema
});

module.exports = {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
