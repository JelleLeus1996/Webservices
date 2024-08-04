import teamService from '../service/team';
import Koa from 'koa';

const requireAuthentication = async (ctx: Koa.Context, next: Koa.Next): Promise<any> =>{
  const {authorization}=ctx.headers;
  //If you login you'll get a token and all session info like team name, country etc.
  const {authToken,...session} = await teamService.checkAndParseSession(authorization);

  ctx.state.session=session;
  ctx.state.authToken=authToken;

  return next();
};

//use currying here:
const makeRequireRole = (role: string)=> async(ctx: Koa.Context, next: Koa.Next): Promise<any> =>{
  const {roles=[]} = ctx.state.session;

  teamService.checkRole(role, roles);

  return next();
};

export {requireAuthentication,makeRequireRole};