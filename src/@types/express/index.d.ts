import { Request as Req } from 'express';
import multer, { Multer } from 'multer';

declare module 'express' {
  interface Request extends Req {
    fileValidationError?: Error;
    file?: Express.Multer.File;
  }
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        publicUrl?: string;
      }
    }
  }
}
