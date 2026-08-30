import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors
        .map((e) => `${e.path.join('.') || 'body'}: ${e.message}`)
        .join(', ');
      const err: any = new Error(message);
      err.status = 400;
      return next(err);
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      const message = parsed.error.errors
        .map((e) => `${e.path.join('.') || 'query'}: ${e.message}`)
        .join(', ');
      const err: any = new Error(message);
      err.status = 400;
      return next(err);
    }
    (req as any).validatedQuery = parsed.data;
    next();
  };
}