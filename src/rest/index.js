const Router = require('@koa/router');

const installTeamRouter = require('./team');//import of function from transaction
const installRiderRouter = require ('./rider');

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */
module.exports = (app) => {
  const router = new Router({
    prefix: '/api',
  });

  installTeamRouter(router);
  installRiderRouter(router);

  app.use(router.routes())
    .use(router.allowedMethods());
};
