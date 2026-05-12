import AppError from "@src/errors/app.error";
import { v2 as cloudinary } from "cloudinary";
import { StatusCodes } from "http-status-codes";
import fs from "fs";

export const uploadFile = async (path: string) => {
  const uploaded = await cloudinary.uploader.upload(path, {
    folder: "codesync-uploads",
  });

  if (!uploaded) {
    throw new AppError(
      `An error occurred during upload.`,
      StatusCodes.FAILED_DEPENDENCY,
    );
  }

  unlinkFile(path);

  return uploaded;
};

export const unlinkFile = (path: string) => {
  return fs.unlink(path, (e) => {
    console.log(`Unlink File: ` + JSON.stringify(e));
  });
};
