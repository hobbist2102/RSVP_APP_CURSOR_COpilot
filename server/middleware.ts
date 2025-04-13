import { Request, Response, NextFunction } from "express";
import { User as SchemaUser } from "../shared/schema";

// Declare global Express namespace extensions
declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Insufficient permissions" });
};