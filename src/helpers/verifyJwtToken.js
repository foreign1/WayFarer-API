import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export default (token) => {
  const jwtPrivateKey = process.env.NODE_ENV === 'test' ? process.env.TEST_JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY : process.env.JWT_PRIVATE_KEY;
  return jwt.verify(token, jwtPrivateKey);
};
