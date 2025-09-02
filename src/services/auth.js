import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } from '../constants/index.js';

const createSession = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFETIME,
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFETIME,
  });

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),  
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),  
  };
};

export const registerUser = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const user = await User.create(payload);
  
  const { password, ...userData } = user.toObject();
  return userData;
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, 'Unauthorized');
  }

  const isPasswordCorrect = await user.comparePassword(payload.password);
  if (!isPasswordCorrect) {
    throw createHttpError(401, 'Unauthorized');
  }
 
  await Session.deleteOne({ userId: user._id });
 
  const sessionData = createSession(user._id);
  const session = await Session.create({
    userId: user._id,
    ...sessionData,
  });

  return session;

};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isRefreshTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if (isRefreshTokenExpired) {
    throw createHttpError(401, 'Refresh token expired');
  }
 
  await Session.deleteOne({ _id: sessionId });
 
   const newSessionData = createSession(session.userId);
  const newSession = await Session.create({
    userId: session.userId,
    ...newSessionData,
  });

  return newSession;

};

export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};