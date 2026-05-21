import jwt from 'jsonwebtoken';
import { config } from '../config';

export const issueAccessToken = (employeeId: string, role: string) => {
  return jwt.sign({ sub: employeeId, role }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

export const issueRefreshToken = (employeeId: string, uniqueHash: string) => {
  return jwt.sign({ sub: employeeId, hash: uniqueHash }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.JWT_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};
