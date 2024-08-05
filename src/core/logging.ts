
import winston from 'winston';
const { combine, timestamp, colorize, printf } = winston.format;

interface Logger {
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

let rootLogger: Logger | null = null;

/**
 * Get the root logger.
 */
const getLogger = () => {
  if (!rootLogger) {
    throw new Error('You must first initialize the logger');
  }

  return rootLogger;
};

/**
 * Define the logging format. We output a timestamp, context (name), level, message and the stacktrace in case of an error (creation of a structured error message)
 */
const loggerFormat = () => {
  const formatMessage = ({
    level,
    message,
    timestamp,
    name = 'server',
    ...rest
  }: winston.Logform.TransformableInfo) =>
    `${timestamp} | ${name} | ${level} | ${message} | ${JSON.stringify(rest)}`;

  const formatError = (info: winston.Logform.TransformableInfo) => {
    const { error, ...rest } = info;
    return `${formatMessage(rest)}\n\n${error instanceof Error ? error.stack : 'Error'}\n`;
  };

  const format = (info: winston.Logform.TransformableInfo) =>
    info instanceof Error ? formatError(info) : formatMessage(info);

  return combine(colorize(), timestamp(), printf(format));
};

/**
 * Initialize the root logger.
 *
 * @param {object} options - The options.
 * @param {string} options.level - The log level.
 * @param {boolean} options.disabled - Disable all logging.
 * @param {object} options.defaultMeta - Default metadata to show.
 */
const initializeLogger = ({
  level,
  disabled = false,
  defaultMeta = {}
}:{
  level: string;
  disabled?: boolean;
  defaultMeta?: object;
}): Logger => {
  rootLogger = winston.createLogger({
    level,
    format: loggerFormat(),
    defaultMeta,
    transports: [
      new winston.transports.Console({
        silent: disabled,
      }),
    ],
  }) as Logger;

  return rootLogger;
};

export {
  initializeLogger,
  getLogger,
};