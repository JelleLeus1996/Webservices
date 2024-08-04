
import config from 'config'; //require config
import bodyParser from 'koa-bodyparser'; //piece of middleware with async functions
import koaCors from '@koa/cors';
import emoji from 'node-emoji';
import swaggerJSDoc from 'swagger-jsdoc';
import { koaSwagger } from 'koa2-swagger-ui';
import Koa from 'koa';

import { getLogger } from './logging'; 
import ServiceError from './serviceError'; 

//read from the confiugrations the cors configurations
const CORS_ORIGINS: string[] = config.get('cors.origins'); // 👈 2
const CORS_MAX_AGE: number = config.get('cors.maxAge'); // 👈 2
const NODE_ENV: string = config.get('env'); 

export default function installMiddleware(app: Koa): void {
  app.use(
    koaCors({
      origin: (ctx: Koa.Context) => {
        // 👈 4
        //check if it has access -> Origin
        if (CORS_ORIGINS.indexOf(ctx.request.header.origin) !== -1) {
          return ctx.request.header.origin;
        }
        // Not a valid domain at this point, let's return the first valid as we should return a string
        return CORS_ORIGINS[0];
      },
      allowHeaders: ['Accept', 'Content-Type', 'Authorization'], // 👈 5
      maxAge: CORS_MAX_AGE, // 👈 6
    })
  );
  app.use(async (ctx: Koa.Context, next: Koa.Next)=>{
    getLogger().info(`${emoji.get('fast_forward')} ${ctx.method} ${ctx.url}`);

    const getStatusEmoji = (): String =>{
      if (ctx.status >= 500) return emoji.get('skull');
      if (ctx.status >= 400) return emoji.get('x');
      if (ctx.status >= 300) return emoji.get('rocket');
      if (ctx.status >= 200) return emoji.get('white_check_mark');
      return emoji.get('rewind');
    };

    //wait untill pipeline is finished
    try {
      await next();
      //log info with method + url + status
      getLogger().info(
        `${getStatusEmoji()} ${ctx.method} ${ctx.status} ${ctx.url}`
      );
    } catch (error){
      getLogger().error(
        `${emoji.get('x')} ${ctx.method} ${ctx.status} ${ctx.url}`,
        {
          error,
        }
      );

      throw error;
    }
  });

  app.use(bodyParser()); //add bodyparser

  app.use(async (ctx: Koa.Context, next: Koa.Next) => {
    try {
      await next(); 
    } catch (error) {
      getLogger().error('Error occured while handling a request', { error }); 
      let statusCode = error.status || 500; 
      let errorBody = { 
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        details: error.details || {},
        stack: NODE_ENV !== 'production' ? error.stack : undefined,
      };
  
      if (error instanceof ServiceError) {
        if (error.isNotFound) {
          statusCode = 404;
        }
  
        if (error.isValidationFailed) {
          statusCode = 400;
        }
        if (error.isUnauthorized) {
          statusCode = 401;
        }
        if (error.isForbidden) {
          statusCode = 403;
        }
      }
  
      ctx.status = statusCode; 
      ctx.body = errorBody; 
    }
  });
  
  // Handle 404 not found with uniform response
  app.use(async (ctx: Koa.Context, next: Koa.Next) => {
    await next();
  
    if (ctx.status === 404) {
      ctx.status = 404;
      ctx.body = {
        code: 'NOT_FOUND',
        message: `Unknown resource: ${ctx.url}`,
      };
    }
  });
};