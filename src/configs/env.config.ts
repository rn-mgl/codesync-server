const REQUIRED_ENV = [
  "JWT_LOGIN_TOKEN",
  "JWT_REGISTER_TOKEN",
  "JWT_RESET_TOKEN",
  "JWT_LOGIN_TTL",
  "JWT_REGISTER_TTL",
  "JWT_RESET_TTL",
  "JWT_AUTH_ALGO",
  "APP_URL",
  "EMAIL_CONNECTOR",
  "EMAIL_SOURCE",
  "DB_HOST",
  "DB_USER",
  "DB_NAME",
  "DB_PORT",
  "DB_PASS",
] as const;

type EnvKeys = (typeof REQUIRED_ENV)[number];

const validateEnv = (): Record<EnvKeys, string> => {
  const env = {} as Record<EnvKeys, string>;

  for (const key of REQUIRED_ENV) {
    const value = process.env[key];

    if (value === undefined) {
      throw new Error(`Missing required env: ${key}`);
    }

    env[key] = value;
  }

  return env;
};

export const env = validateEnv();
