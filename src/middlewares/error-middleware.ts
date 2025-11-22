import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

const errorMiddleware = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res
    .status(500)
    .json({
      success: false,
      error: "An error in the server occurred. Please try again.",
    });
};

export default errorMiddleware;
