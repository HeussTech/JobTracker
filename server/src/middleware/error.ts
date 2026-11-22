import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError } from "zod";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const asyncHandler =
  (fn: AsyncHandler): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Données invalides", details: err.flatten().fieldErrors });
  }
  console.error(err);
  res.status(500).json({ error: "Erreur interne du serveur" });
}
