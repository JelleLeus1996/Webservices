import Joi from 'joi'; 
import { Context, Next } from 'koa';

const JOI_OPTIONS: Joi.ValidationOptions = {
  abortEarly: true,
  allowUnknown: false,
  context: true,
  convert: true,
  presence: 'required',
};

interface JoiErrorDetail {
  message: string;
  path: (string | number)[];
  type: string;
}

interface JoiError {
  details: JoiErrorDetail[];
}

interface ValidationSchema {
  query?: Joi.ObjectSchema;
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

const cleanupJoiError = (error: JoiError) =>
  error.details.reduce((resultObj: Record<string, {type:string,message: string}[]>, { message, path, type }) => {
    const joinedPath = path.join('.') || 'value';
    if (!resultObj[joinedPath]) {
      resultObj[joinedPath] = [];
    }
    resultObj[joinedPath].push({
      type,
      message,
    });

    return resultObj;
  }, {});



const validate = (schema:ValidationSchema) => {
  if (!schema) {
    schema = {
      query: Joi.object({}),
      body: Joi.object({}),
      params: Joi.object({}),
    };
  }

  return (ctx: Context, next: Next) => {
    const errors: Record<string, any> = {};

    if (!Joi.isSchema(schema.params)) {
      schema.params = Joi.object(schema.params || {});
    }

    const { error: paramsError, value: paramsValue } = schema.params.validate(
      ctx.params,
      JOI_OPTIONS
    );

    if (paramsError) {
      errors.params = cleanupJoiError(paramsError);
    } else {
      ctx.params = paramsValue;
    }

    if (!Joi.isSchema(schema.body)) {
      schema.body = Joi.object(schema.body || {});
    }

    const { error: bodyError, value: bodyValue } = schema.body.validate(
      ctx.request.body,
      JOI_OPTIONS
    );

    if (bodyError) {
      errors.body = cleanupJoiError(bodyError);
    } else {
      ctx.request.body = bodyValue;
    }

    if (!Joi.isSchema(schema.query)) {
      schema.query = Joi.object(schema.query || {});
    }

    const { error: queryError, value: queryValue } = schema.query.validate(
      ctx.query,
      JOI_OPTIONS
    );

    if (queryError) {
      errors.query = cleanupJoiError(queryError);
    } else {
      ctx.query = queryValue;
    }

    if (Object.keys(errors).length) {
      ctx.throw(400, 'Validation failed, check details for more information', {
        code: 'VALIDATION_FAILED',
        details: errors,
      });
    }

    return next();
  };
};
export default validate;