const Router = require('@koa/router');
const Joi = require('joi');

const teamService = require('../service/team');
const validate = require('../core/validation');
const {requireAuthentication, makeRequireRole} = require('../core/auth');
const Role = require('../core/roles');

//Login to authenticate and to (dis)allow certain requests
const login = async (ctx, next) => {
  const {email, password} = ctx.
    request.body;
  console.log('Received request body:', {email, password});
  const token = await teamService.login(email, password);
  ctx.body=token;
  return next;
};

//Validation of the given login info
login.validationScheme = {
  body:{
    email: Joi.string().email(),
    password:Joi.string(),
  }
};

//Verification team via paramater & session id
const checkTeamId = (ctx, next) => {
  const { teamId:sessionTeamId, roles } = ctx.state.session;
  const { teamId:paramTeamId } = ctx.params;

  if (paramTeamId !== sessionTeamId && !roles.includes(Role.ADMIN)) {
    return ctx.throw(
      403,
      'You are not allowed to view this user\'s information',
      {
        code: 'FORBIDDEN',
      }
    );
  }
  return next();
};

//GET all teams
const getTeams = async (ctx) => {
  ctx.body = await teamService.getTeams();
};
const getTeamWithRiders = async (ctx) => {
  ctx.body = await teamService.getAll(ctx.params.teamId);
};
const getAllTeamsInfo = async (ctx) => {
  ctx.body = await teamService.getAllTeamsInfo();
};
//No input, so no validations of input
getTeams.validationScheme = null;
getAllTeamsInfo.validationScheme = null;

//GET individual team (by teamid)
const getTeamById = async (ctx) => {
  ctx.body = await teamService.getById(ctx.params.teamId);
};

//Validation of the paramater teamid
getTeamById.validationScheme = {
  params: Joi.object({
    teamId: Joi.number().integer().positive().required(),
  })
};

//GET individual team (by name)
const getTeamByName = async (ctx) => {
  ctx.body = await teamService.getTeamByName(String(ctx.params.name));
};

//Validation of the paramater name
getTeamByName.validationScheme = {
  params: Joi.object({
    name: Joi.string().required()
  })
};

//UPDATE team
const updateTeam = async (ctx) => {
  ctx.body = await teamService.updateById(Number(ctx.params.teamId),{
    ...ctx.request.body,
    name: String(ctx.request.body.name),
    country: String(ctx.request.body.country),
    victories: Number(ctx.request.body.victories),
    points: Number(ctx.request.body.points),
    team_status: String(ctx.request.body.team_status),
    abbreviation: String(ctx.request.body.abbreviation),
    director: String(ctx.request.body.director),
    assistant: String(ctx.request.body.assistant),
    representative: String(ctx.request.body.representative),
    bike: String(ctx.request.body.bike),
    overhead_cost: Number(ctx.request.body.overhead_cost),
    email: String(ctx.request.body.email),
  });
};

//Validation of the paramater teamid & the given team info
updateTeam.validationScheme={
  params: Joi.object({
    teamId: Joi.number().integer().positive().required()
  }),
  //Joi.object is not needed, because if it's not a Joi schema, it creats a joi schema it self, see line 26 of validation
  body: {
    name: Joi.string().min(1).max(99).required(),
    country: Joi.string().min(1).max(50).required(),
    victories: Joi.number().min(0).max(250),
    points: Joi.number().min(0).max(1000000),
    team_status: Joi.string().min(3).max(3).required(),
    abbreviation: Joi.string().min(3).max(3).required(),
    director: Joi.string().min(1).max(99).required(),
    assistant: Joi.string().min(1).max(99).required(),
    representative: Joi.string().min(1).max(99).required(),
    bike: Joi.string().min(1).max(50).required(),
    teamId: Joi.number().integer().required(),
    overhead_cost: Joi.number().min(100000).max(50000000).required(),
    email: Joi.string().email(),
  }
};

//POST team
const createTeam = async (ctx) => {
  const newTeam = await teamService.create({
    ...ctx.request.body,
    teamId: Number(ctx.request.body.teamId),
    name: String(ctx.request.body.name),
    country: String(ctx.request.body.country),
    victories: Number(ctx.request.body.victories),
    points: Number(ctx.request.body.points),
    team_status: String(ctx.request.body.team_status),
    abbreviation: String(ctx.request.body.abbreviation),
    director: String(ctx.request.body.director),
    assistant: String(ctx.request.body.assistant),
    representative: String(ctx.request.body.representative),
    bike: String(ctx.request.body.bike),
    overhead_cost: Number(ctx.request.body.overhead_cost),
    email: String(ctx.request.body.email),
    password: String(ctx.request.body.password),
  });
  ctx.status = 201;
  ctx.body = newTeam;
};

//Validation of the given team info
createTeam.validationScheme={
  //Joi.object is not needed, because if it's not a Joi schema, it creats a joi schema it self, see line 26 of validation
  body: {
    name: Joi.string().min(1).max(99).required(),
    country: Joi.string().min(1).max(50).required(),
    victories: Joi.number().min(0).max(250),
    points: Joi.number().min(0).max(1000000),
    team_status: Joi.string().min(3).max(3).required(),
    abbreviation: Joi.string().min(3).max(3).required(),
    director: Joi.string().min(1).max(99).required(),
    assistant: Joi.string().min(1).max(99).required(),
    representative: Joi.string().min(1).max(99).required(),
    bike: Joi.string().min(1).max(50).required(),
    teamId: Joi.number().integer().required(),
    overhead_cost: Joi.number().min(100000).max(50000000).required(),
    email: Joi.string().email(),
    password: Joi.string().min(8).max(60),
  }
};

//DELETE team
const deleteTeam = async (ctx) => {
  teamService.deleteById(Number(ctx.params.teamId));
  ctx.stats = 204;
};

//Validation of the paramater teamid
deleteTeam.validationScheme = {
  params: Joi.object({
    teamId: Joi.number().integer().positive().required()
  })
};

/**
 * Install team routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {//created nested route
  const router = new Router({
    prefix: '/teams',
  });

  //Variable assigned for admin required requests
  const requireAdmin = makeRequireRole(Role.ADMIN);

  //POST to login
  router.post('/login',validate(login.validationScheme), login);

  //GET
  router.get('/', requireAuthentication, validate(getTeams.validationScheme), getTeams);
  router.get('/allInfo', requireAuthentication, validate(getAllTeamsInfo.validationScheme), checkTeamId, getAllTeamsInfo);
  router.get('/:teamId', requireAuthentication, validate(getTeamById.validationScheme), checkTeamId, getTeamById);
  router.get('/name/:name',requireAuthentication, validate(getTeamByName.validationScheme),checkTeamId, getTeamByName);
  router.get('/getTeamWithRiders/:teamId', requireAuthentication, getTeamWithRiders);

  //POST
  router.post('/',requireAuthentication,requireAdmin, validate(createTeam.validationScheme), createTeam);

  //UPDATE (PUT)
  router.put('/:teamId',requireAuthentication, validate(updateTeam.validationScheme), checkTeamId,updateTeam);

  //DELETE
  router.delete('/:teamId', requireAuthentication, requireAdmin, validate(deleteTeam.validationScheme), deleteTeam);
  

  app.use(router.routes())
    .use(router.allowedMethods());
};



