import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';  

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return next(createHttpError(401, 'Authorization header not found'));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Token is not in valid format'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = payload;
 
    const session = await Session.findOne({ userId });
    if (!session) { 
      return next(createHttpError(401, 'Not authorized: session not found. Please log in again.'));
    } 

    const user = await User.findById(userId);
    if (!user) {
      return next(createHttpError(401, 'User associated with this session not found'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Access token expired'));
    }
    next(createHttpError(401, 'Not authorized'));
  }
};