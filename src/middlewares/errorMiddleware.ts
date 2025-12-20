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
  let message = "An error in the server occurred. Please try again.";
  let statusCode = 500;

  if ("message" in err && typeof err.message === "string") {
    message = err.message;
  }

  if ("statusCode" in err && typeof err.statusCode === "number") {
    statusCode = err.statusCode;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorMiddleware;
