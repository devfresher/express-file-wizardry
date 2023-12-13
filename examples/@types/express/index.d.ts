import { Request as Req } from 'express';

declare module 'express' {
  export interface Request extends Req {
    fileValidationError?: Error;
  }
}
