import Router from '@koa/router';
import Koa from 'koa';

import installTeamRouter from './team';
import installRiderRouter from './rider';

/**
 * Install all routes in the given Koa application.
 *
 * @param {Koa} app - The Koa application.
 */

export default(app:Koa):void =>{
  const router = new Router({
    prefix:'/api'
  });

  installTeamRouter(router);
  installRiderRouter(router);

  app.use(router.routes())
    .use(router.allowedMethods());
};
