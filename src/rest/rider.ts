import Router from '@koa/router';
import Joi from 'joi';
import dateExtension from '@joi/date';
import Koa from 'koa';

import riderService from '../service/rider';
import validate from '../core/validation';
import {requireAuthentication, makeRequireRole} from '../core/auth';
import Role = require('../core/roles');

const JoiDate = Joi.extend(dateExtension);

//Verification team via paramater
const checkTeamId = (ctx: Koa.Context, next: Koa.Next) => {
  const { teamId:paramTeamId } = ctx.params;
  // You can only get our own data unless you're an admin
  checkTeam(ctx, paramTeamId);
  return next();
};

//Verification team via session id or role
const checkTeam = (ctx: Koa.Context, teamId: number)=>{
  const { teamId:sessionTeamId, roles } = ctx.state.session;
  if (teamId !== sessionTeamId && !roles.includes(Role.ADMIN)) {
    ctx.throw(403, 'You are not allowed to view this user\'s information',
      {
        code: 'FORBIDDEN',
      });
  }
};

//Verification via paramater of rider to get teamId
const checkTeamIdViaRider = async (ctx: Koa.Context, next: Koa.Next) => {
  const { id } = ctx.params;
  const rider = await riderService.getById(Number(id));
  checkTeam(ctx, rider.teamId);
  return next();
};

//GET all riders
const getRiders = async (ctx: Koa.Context) => {
  ctx.body = await riderService.getAll();
};
const getAllRidersInfo = async (ctx: Koa.Context) => {
  ctx.body = await riderService.getAllRidersInfo();
};

//GET all riders with team info
const getAllRidersWithTeam = async (ctx: Koa.Context) =>
{
  ctx.body = await riderService.getAllWithTeam();
};

//No input, so no validations of input
getRiders.validationScheme = null;
getAllRidersInfo.validationScheme = null;
getAllRidersWithTeam.validationScheme = null;

//GET individual rider (by id)
const getRiderById = async (ctx: Koa.Context) => {
  ctx.body = await riderService.getById(Number(ctx.params.id));
};

//Validation of the paramater id
getRiderById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

//GET individual rider (by full name)
const getRiderByFullName = async (ctx: Koa.Context) => {
  ctx.body = await riderService.getRiderByFullName(
    String(ctx.params.first_name),
    String(ctx.params.last_name));
};

//Validation of the paramaters first & last name
getRiderByFullName.validationScheme = {
  params: Joi.object({
    last_name: Joi.string().min(1).max(50).required(),
    first_name: Joi.string().min(1).max(50).required(),
  })
};

//GET individual team (by id)
const getRidersFromTeam = async (ctx: Koa.Context) => {
  ctx.body = await riderService.getRidersFromTeam(Number(ctx.params.teamId));
};

//Validation of the paramater id
getRidersFromTeam.validationScheme={
  params: Joi.object({
    teamId: Joi.number().integer().positive().required()
  })
};

//UPDATE rider
const updateRider = async (ctx: Koa.Context) => {
  ctx.body = await riderService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    nationality: String(ctx.request.body.nationality),
    last_name: String(ctx.request.body.last_name),
    first_name: String(ctx.request.body.first_name),
    birthday: new Date(ctx.request.body.birthday),
    points: Number(ctx.request.body.points),
    teamId: ctx.state.session.teamId,
    monthly_wage: Number(ctx.request.body.monthly_wage),  
  });
};

//Validation of the paramater id & the given rider info
updateRider.validationScheme={
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    nationality: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    first_name: Joi.string().min(1).max(50).required(),
    teamId: Joi.number().integer().required(),
    birthday: JoiDate.date().greater('1-1-1970').required(),
    points: Joi.number().min(0).max(1000000),
    monthly_wage: Joi.number().min(0).max(1000000),
  }),
};

//POST rider
const createRider = async (ctx: Koa.Context) => {
  const newRider = await riderService.create({
    ...ctx.request.body,
    nationality: String(ctx.request.body.nationality),
    last_name: String(ctx.request.body.last_name),
    first_name: String(ctx.request.body.first_name),
    birthday: new Date(ctx.request.body.birthday),
    points: Number(ctx.request.body.points),
    teamId: ctx.state.session.teamId,
    monthly_wage: Number(ctx.request.body.monthly_wage),  
  });
  ctx.body = newRider;
};

//Validation of the given rider info
createRider.validationScheme={
  body: Joi.object({
    id: Joi.number().integer().required(),
    nationality: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    first_name: Joi.string().min(1).max(50).required(),
    birthday: JoiDate.date().greater('1-1-1970').required(),
    points: Joi.number().min(0).max(1000000),
    monthly_wage: Joi.number().min(0).max(1000000),
  }),
};

//DELETE rider
const deleteRider = async (ctx: Koa.Context) => {
  await riderService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

//Validation of the paramater id
deleteRider.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

/**
 * Install riders routes in the given router.
 *
 * @param {Router} app - The parent router.
 */

export default (app: Router) => {
  const router = new Router({
    prefix: '/riders',
  });

  //Variable assigned for admin required requests
  const requireAdmin = makeRequireRole(Role.ADMIN);

  //GET
  router.get('/', requireAuthentication, validate(getRiders), getRiders);
  router.get('/allInfo', requireAuthentication, validate(getAllRidersInfo), checkTeamId, getAllRidersInfo);
  router.get('/all/getAllRidersWithTeam', requireAuthentication, validate(getAllRidersWithTeam.validationScheme),getAllRidersWithTeam);
  router.get('/full-name/:first_name/:last_name', requireAuthentication, validate(getRiderByFullName.validationScheme), checkTeamId, getRiderByFullName);
  router.get('/:id', requireAuthentication, validate(getRiderById.validationScheme),checkTeamIdViaRider, getRiderById);
  router.get('/team/:teamId', requireAuthentication, validate(getRidersFromTeam.validationScheme),checkTeamId, getRidersFromTeam);

  //POST
  router.post('/', requireAuthentication,requireAdmin, validate(createRider.validationScheme), createRider);

  //UPDATE (PUT)
  router.put('/:id',requireAuthentication, validate(updateRider.validationScheme),checkTeamIdViaRider, updateRider);

  //DELETE
  router.delete('/:id',requireAuthentication, requireAdmin, validate(deleteRider.validationScheme), deleteRider);
  
  app.use(router.routes())
    .use(router.allowedMethods());
};
/*
JSON Login for admin
{
  "email":"jelle.leus@student.hogent.be",
  "password":"12345678"
}
JSON Login for non-admin - team 5
{
  "email":"Hendrik.Redant@hotmail.com",
  "password":"12345678"
}
*/
