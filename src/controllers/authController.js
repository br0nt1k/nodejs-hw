import createHttpError from "http-errors";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt';
import { createSession } from "../services/auth.js";
import { setSessionCookies } from "../services/auth.js";
import { Session } from "../models/session.js";

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(createHttpError(409, 'Email in use')); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword
    });

    const newSession = await createSession(newUser._id);
    setSessionCookies(res, newSession);

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(createHttpError(401, 'Invalid credentials'));
    }

    await Session.deleteOne({ userId: user._id });
    
    const newSession = await createSession(user._id);
    setSessionCookies(res, newSession);

    res.status(200).json({
      status: 200,
      message: "Successfully logged in an user!",
      data: {
        accessToken: newSession.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken
    });

    if (!session) {
      return next(createHttpError(401, 'Session not found'));
    }

    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    
    if (isSessionTokenExpired) {
      return next(createHttpError(401, 'Session token expired'));
    }

    await Session.deleteOne({
      _id: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken
    });

    const newSession = await createSession(session.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({
      status: 200,
      message: "Session refreshed",
      data: {
        accessToken: newSession.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;
    
    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};