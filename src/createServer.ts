import config from 'config'; //require config
import Koa from'koa';

import installRest from './rest/index';
import { initializeData, shutdownData } from './data';
import { initializeLogger, getLogger } from './core/logging';
import installMiddleware from './core/installMiddleware';
 
//Read config from config folder
const LOG_LEVEL = config.get<string>('logging.level');
const LOG_DISABLED = config.get<boolean>('logging.disabled');
const NODE_ENV = config.get<string>('env'); // process.env.NODE_ENV;

interface Server {
  getApp: () => Koa;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export default async function createServer():Promise<Server> {
  //create logging
  initializeLogger({
    level: LOG_LEVEL,
    disabled: LOG_DISABLED,
    defaultMeta: { NODE_ENV },
  });
 
  await initializeData();
 
  getLogger().info(
    `log level ${LOG_LEVEL}, disabled ${LOG_DISABLED} in env ${NODE_ENV}`
  );
  //const router = new Router();
  const app = new Koa();
  installMiddleware(app);
 
  installRest(app);
 
  return {
    getApp(){
      return app;
    },
    start(){
      return new Promise<void>((resolve)=>{
        const port = config.get('port');
        app.listen(port);
        getLogger().info(`server is running at http:\\localhost:${port}`);
        resolve();
      });
    },
    async stop(){
      app.removeAllListeners();
      await shutdownData();
      getLogger().info('Goodbye');
    },
  };
};