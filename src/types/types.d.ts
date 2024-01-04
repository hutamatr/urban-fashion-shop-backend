// import { JwtPayload } from 'jsonwebtoken';
declare module 'image-to-webp';
declare namespace Express {
  export interface Request {
    userId?: number;
    user?: T;
    isAdmin?: boolean;
  }
}
