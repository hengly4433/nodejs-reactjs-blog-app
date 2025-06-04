// src/types/express/index.d.ts

import { IUser } from '../../models/User';

// We declare a global augmentation of the Express namespace.
// Because this file has an `import`, TypeScript treats it as a module;
// but `declare global { … }` allows us to merge into the ambient Express types.
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// This line ensures the file is seen as a module by TypeScript
// (so that the import above is valid). It does not export anything.
export {};
