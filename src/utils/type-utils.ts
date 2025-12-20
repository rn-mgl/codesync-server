import { type BaseUserData } from "@interface/user-interface.ts";
import type {
  AdditionalProblemData,
  BaseProblemData,
} from "@src/interface/problem-interface";
import type {
  AdditionalTopicData,
  BaseTopicData,
} from "@src/interface/topic-interface";

export const isBaseUserData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseUserData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseUserData)[] = [
    "email",
    "first_name",
    "last_name",
    "password",
    "username",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  }
};

export const isBaseProblemData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is BaseProblemData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof BaseProblemData)[] = [
    "title",
    "slug",
    "description",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  }
};

export const isAdditionalProblemData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalProblemData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: readonly (keyof AdditionalProblemData)[] = [
    "constraints",
    "editorial",
    "input_format",
    "output_format",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  }
};

export const isBaseTopicData = (
  data: unknown,
  type: "partial" | "full" = "full"
): data is BaseTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof BaseTopicData)[] = [
    "name",
    "slug",
    "description",
  ];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  }
};

export const isAdditionalTopicData = (
  data: unknown,
  type: "full" | "partial" = "full"
): data is AdditionalTopicData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const REQUIRED_FIELDS: (keyof AdditionalTopicData)[] = ["icon"];

  if (type === "full") {
    return REQUIRED_FIELDS.every(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  } else {
    return REQUIRED_FIELDS.some(
      (field) =>
        field in data &&
        data[field as keyof object] &&
        typeof data[field as keyof object] === "string"
    );
  }
};
