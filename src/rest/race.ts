import Router from '@koa/router';
import Joi from 'joi';
import dateExtension from '@joi/date';
import Koa from 'koa';

import raceService from '../service/race';
import validate from '../core/validation';
import {requireAuthentication, makeRequireRole} from '../core/auth';
import Role = require('../core/roles');

const JoiDate = Joi.extend(dateExtension);

//GET all races
const getRaces = async (ctx: Koa.Context) => {
  ctx.body = await raceService.getAll();
};

//GET race by id
const getRaceById = async (ctx: Koa.Context) => {
  ctx.body = await raceService.getById(Number(ctx.params.id));
};

//GET race by id with all teams
const getRaceWithTeams = async (ctx: Koa.Context) =>
{
  ctx.body = await raceService.getByIdWithTeams(Number(ctx.params.id));
};

//No input, so no validations of input
getRaces.validationScheme = null;


//Validation of the paramater id
getRaceById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};
//Validation of the paramater id
getRaceWithTeams.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

//UPDATE race
const updateRace = async (ctx: Koa.Context) => {
  ctx.body = await raceService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    name: String(ctx.request.body.name),
    date: new Date(ctx.request.body.date),
    location: String(ctx.request.body.location),
  });
};

//Validation of the paramater id & the given race info
updateRace.validationScheme={
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body:{
    name: Joi.string().min(1).max(99).required(),
    date: JoiDate.date().greater('1-1-2022').required(),
    location: Joi.string().min(1).max(99).required(),
  }
};

//POST race
const createRace = async (ctx: Koa.Context) => {
  const newRace = await raceService.create({
    ...ctx.request.body,
    name: String(ctx.request.body.name),
    date: new Date(ctx.request.body.industry),
    location: String(ctx.request.body.location),  
  });
  ctx.body = newRace;
};

//Validation of the given rider info
createRace.validationScheme={
  body:Joi.object({
    id: Joi.number().integer().required(),
    name: Joi.string().min(1).max(99).required(),
    date: JoiDate.date().greater('1-1-2022').required(),
    location: Joi.string().min(1).max(99).required(),
  }),
};

//DELETE sponsor
const deleteRace = async (ctx: Koa.Context) => {
  await raceService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

//Validation of the paramater id
deleteRace.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

//Add team to a race
const addTeamToRace = async (ctx: Koa.Context) => {
  await raceService.postTeamToRace(Number(ctx.params.raceId),Number(ctx.params.teamId));
  ctx.status = 204;
};
//Validation of the paramater id
addTeamToRace.validationScheme = {
  params: Joi.object({
    raceId: Joi.number().integer().positive().required(),
    teamId: Joi.number().integer().positive().required(),
  })
};

//Add teams to a race
const addTeamsToRace = async (ctx: Koa.Context) => {
  await raceService.postTeamsToRace(Number(ctx.params.raceId),Number(ctx.params.teamIds));
  ctx.status = 204;
};
//Validation of the paramater id
addTeamsToRace.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body: Joi.object({
    teamIds: Joi.array().items(Joi.number().integer().positive()).required(),
  }),
};

//delete team from a race
const deleteTeamFromRace = async (ctx: Koa.Context) => {
  await raceService.deleteTeamFromRace(Number(ctx.params.raceId),Number(ctx.params.teamId));
  ctx.status = 204;
};
//Validation of the paramater id
deleteTeamFromRace.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required(),
    teamId: Joi.number().integer().positive().required(), 
  })
};

//delete all teams from a race
const deleteAllTeamsFromRace = async (ctx: Koa.Context) => {
  await raceService.deleteAllTeamsFromRace(Number(ctx.params.id));
  ctx.status = 204;
};
//Validation of the paramater id
deleteAllTeamsFromRace.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};
/**
 * Install races routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
export default (app: Router) => {
  const router = new Router({
    prefix: '/races',
  });

  //Variable assigned for admin required requests
  const requireAdmin = makeRequireRole(Role.ADMIN);

  //GET
  router.get('/', validate(getRaces), getRaces);
  router.get('/withTeams/:raceId', validate(getRaceWithTeams.validationScheme), getRaceWithTeams);
  router.get('/:raceId', requireAuthentication, validate(getRaceById.validationScheme), getRaceById);

  //POST
  router.post('/', requireAuthentication,requireAdmin, validate(createRace.validationScheme), createRace);
  router.post('/team/:ids', requireAuthentication, requireAdmin, validate(addTeamsToRace.validationScheme), addTeamsToRace);
  router.post('/team/:id', requireAuthentication, requireAdmin, validate(addTeamToRace.validationScheme), addTeamToRace);

  //UPDATE (PUT)
  router.put('/:id',requireAuthentication, validate(updateRace.validationScheme), updateRace);

  //DELETE
  router.delete('/:id',requireAuthentication, requireAdmin, validate(deleteRace.validationScheme), deleteRace);
  router.delete('/team/all/:id', requireAuthentication, requireAdmin, validate(deleteAllTeamsFromRace), deleteAllTeamsFromRace);
  router.delete('/team/:id', requireAuthentication, requireAdmin, validate(deleteTeamFromRace.validationScheme),deleteTeamFromRace);

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
