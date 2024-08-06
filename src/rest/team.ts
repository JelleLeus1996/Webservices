import Router from '@koa/router';
import Joi from 'joi';
import dateExtension from '@joi/date';
import Koa from 'koa';

import teamService from '../service/team';
import validate from '../core/validation';
import {requireAuthentication, makeRequireRole} from '../core/auth';
import {Role} from '../core/roles';
import {Knex} from 'knex';

const JoiDate = Joi.extend(dateExtension);

//Login to authenticate and to (dis)allow certain requests
const login = async (knex: Knex, ctx: Koa.Context, next: Koa.Next) => {
  const {email, password} = ctx.
    request.body;
  console.log('Received request body:', {email, password});
  const token = await teamService.login(knex, email, password);
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
const checkTeamId = (ctx: Koa.Context, next: Koa.Next) => {
  const { teamId:sessionTeamId, roles } = ctx.state.session;
  const { teamId:paramTeamId } = ctx.params;

  if (paramTeamId !== sessionTeamId && !roles.includes(Role.ADMIN)) {
    ctx.throw(403,'You are not allowed to view this user\'s information',
      {
        code: 'FORBIDDEN',
      });
  }
  return next();
};

//GET all teams
const getTeams = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.getTeams(knex);
};
const getTeamWithRiders = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.getAll(ctx.params.teamId);
};
const getAllTeamsInfo = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.getAllTeamsInfo(knex);
};
//No input, so no validations of input
getTeams.validationScheme = null;
getAllTeamsInfo.validationScheme = null;

//GET individual team (by teamid)
const getTeamById = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.getById(knex, ctx.params.teamId);
};

//Validation of the paramater teamid
getTeamById.validationScheme = {
  params: Joi.object({
    teamId: Joi.number().integer().positive().required(),
  })
};

//GET individual team (by name)
const getTeamByName = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.getTeamByName(knex, String(ctx.params.name));
};

//Validation of the paramater name
getTeamByName.validationScheme = {
  params: Joi.object({
    name: Joi.string().required()
  })
};

//UPDATE team
const updateTeam = async (knex: Knex, ctx: Koa.Context) => {
  ctx.body = await teamService.updateById(knex, Number(ctx.params.teamId),{
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
const createTeam = async (knex: Knex, ctx: Koa.Context) => {
  const newTeam = await teamService.create(knex, {
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
const deleteTeam = async (knex: Knex, ctx: Koa.Context) => {
  teamService.deleteById(knex, Number(ctx.params.teamId));
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
export default (app: Router) => {
  const router = new Router({
    prefix: '/riders',
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



