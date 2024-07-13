const teamService = require('../service/team');

const requireAuthentication = async (ctx, next)=>{
  const {authorization}=ctx.headers;
  //If you login you'll get a token and all session info like team name, country etc.
  const {authToken,...session} = await teamService.checkAndParseSession(authorization);

  ctx.state.session=session;
  ctx.state.authToken=authToken;

  return next();
};

//use currying here:
const makeRequireRole = (role)=> async(ctx,next)=>{
  const {roles=[]} = ctx.state.session;

  teamService.checkRole(role, roles);

  return next();
};

module.exports = {requireAuthentication,makeRequireRole};