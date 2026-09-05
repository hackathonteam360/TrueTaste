import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';
import { env } from '../config/env';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  });
}

export const register = asyncHandler(async (req, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
  });

  const token = signToken(user.id);
  return res.status(201).json({ token, user: user.toJSON() });
});

export const login = asyncHandler(async (req, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user.id);
  return res.json({ token, user: user.toJSON() });
});

const googleSchema = z.object({
  idToken: z.string().min(1, 'idToken is required'),
});

export const googleLogin = asyncHandler(async (req, res: Response) => {
  const { idToken } = googleSchema.parse(req.body);

  if (!env.googleWebClientId) {
    return res.status(503).json({ message: 'Google login is not configured on this server' });
  }

  const client = new OAuth2Client(env.googleWebClientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleWebClientId,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const email = (payload?.email || '').toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'Google account has no email address' });
  }

  const googleId = payload?.sub || '';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: payload?.name || email.split('@')[0],
      email,
      googleId,
      avatar: payload?.picture || '',
      password: '',
    });
  } else if (!user.googleId || user.googleId !== googleId) {
    user.googleId = googleId;
    if (!user.avatar && payload?.picture) user.avatar = payload.picture;
    await user.save();
  }

  const token = signToken(String(user._id));
  return res.json({ token, user: user.toJSON() });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({ user });
});