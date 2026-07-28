import { signUpSchema, signInSchema } from '#validations/auth.validation.js';
import logger from '#config/logger.js';
import { formatValidationErrors } from '#utils/format.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { jwttoken } from '#utils/jwt.js';
import cookies from 'cookie';
export const signup = async (req, res, next) => {
  try {
    const validationResult = signUpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { name, email, password } = validationResult.data;
    const user = await createUser({ name, email, password, role: 'user' });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    logger.info(`User registered successfully with email: ${email}`);
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error('Error in signup controller:', err);
    if (err.message === 'User with email already exists')
      return res.status(409).json({ error: 'User with email already exists' });
    next(err);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: formatValidationErrors(validationResult.error),
      });
    }
    const { email, password } = validationResult.data;
    const user = await authenticateUser({ email, password });
    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    cookies.set(res, 'token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    logger.info(`User logged in successfully with email: ${email}`);
    res.status(200).json({
      message: 'User logged in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error('Error in signin controller:', err);
    if (err.message === 'User not found' || err.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(err);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.set(res, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
    logger.info('User logged out successfully');
    res.status(200).json({
      message: 'User logged out successfully',
    });
  } catch (err) {
    logger.error('Error in signout controller:', err);
    next(err);
  }
};
