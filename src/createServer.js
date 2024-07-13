const config = require('config'); //require config
const Koa = require('koa');

const installRest = require('./rest/index');
const { initializeData,shutdownData } = require('./data');
const { initializeLogger, getLogger } = require('./core/logging');
const installMiddleware = require('./core/installMiddleware');
 
//Read config from config folder
const LOG_LEVEL = config.get('logging.level');
const LOG_DISABLED = config.get('logging.disabled');
const NODE_ENV = config.get('env'); //process.env.NODE_ENV;
 
module.exports = async function createServer() {
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
      return new Promise((resolve)=>{
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