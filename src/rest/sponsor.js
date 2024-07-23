const Router = require('@koa/router');
const Joi = require('joi').extend(require('@joi/date'));

const sponsorService = require('../service/sponsor');
const validate = require('../core/validation');
const {requireAuthentication, makeRequireRole} = require('../core/auth');
const Role = require('../core/roles');


//Verification team via paramater
const checkTeamId = (ctx, next) => {
  
  const { teamId:paramTeamId } = ctx.params;

  // You can only get our own data unless you're an admin
  checkTeam(ctx, paramTeamId);
  return next();
};

//Verification team via session id or role
const checkTeam = (ctx, teamId)=>{
  const { teamId:sessionTeamId, roles } = ctx.state.session;
  if (teamId !== sessionTeamId && !roles.includes(Role.ADMIN)) {
    return ctx.throw(
      403,
      'You are not allowed to view this user\'s information',
      {
        code: 'FORBIDDEN',
      }
    );
  }
};

//Verification via paramater of sponsor to get teamId
const checkTeamIdViaSponsor = async (ctx, next) => {
  const { id } = ctx.params;
  const sponsor = await sponsorService.getById(Number(id));
  checkTeam(ctx, sponsor.teamId);
  return next();
};

//GET all sponsors
const getSponsors = async (ctx) => {
  ctx.body = await sponsorService.getAll();
};
const getAllSponsorsInfo = async (ctx) => {
  ctx.body = await sponsorService.getAllWithFinancials();
};

//GET all sponsors with team info
const getAllSponsorInfoWithTeams = async (ctx) =>
{
  ctx.body = await sponsorService.getAllWithTeams();
};

//No input, so no validations of input
getSponsors.validationScheme = null;
getAllSponsorsInfo.validationScheme = null;
getAllSponsorInfoWithTeams.validationScheme = null;

//GET individual sponsor (by id)
const getSponsorById = async (ctx) => {
  ctx.body = await sponsorService.getById(Number(ctx.params.id));
};

//Validation of the paramater id
getSponsorById.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

//GET individual sponsor by name
const getSponsorByName = async (ctx) => {
  ctx.body = await sponsorService.getByName(
    String(ctx.params.name));
};

//Validation of the paramaters first & last name
getSponsorByName.validationScheme = {
  params: Joi.object({
    name: Joi.string().min(1).max(99).required(),
  })
};

//GET individual team (by id)
const getSponsorsFromTeam = async (ctx) => {
  ctx.body = await sponsorService.getByTeamId(Number(ctx.params.teamId));
};

//Validation of the paramater id
getSponsorsFromTeam.validationScheme={
  params: Joi.object({
    teamId: Joi.number().integer().positive().required()
  })
};



//UPDATE sponsor
const updateSponsor = async (ctx) => {
  ctx.body = await sponsorService.updateById(Number(ctx.params.id), {
    ...ctx.request.body,
    name: String(ctx.request.body.name),
    industry: String(ctx.request.body.industry),
    contribution: Number(ctx.request.body.contribution),
    teamId: ctx.state.session.teamId,
  });
};

//Validation of the paramater id & the given sponsor info
updateSponsor.validationScheme={
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  body:{
    name: Joi.string().min(1).max(99).required(),
    industry: Joi.string().min(1).max(99).required(),
    teamId: Joi.number().integer().required(),
    contribution: Joi.number().min(0).max(100000000),
  }
};

//POST sponsor
const createSponsor = async (ctx) => {
  const newSponsor = await sponsorService.create({
    ...ctx.request.body,
    name: String(ctx.request.body.name),
    industry: String(ctx.request.body.industry),
    teamId: ctx.state.session.teamId,
    contribution: Number(ctx.request.body.contribution),  
  });
  ctx.body = newSponsor;
};

//Validation of the given sponsor info
createSponsor.validationScheme={
  body:{
    id: Joi.number().integer().required(),
    name: Joi.string().min(1).max(99).required(),
    industry: Joi.string().min(1).max(99).required(),
    contribution: Joi.number().min(0).max(100000000),
  }
};

//DELETE sponsor
const deleteSponsor = async (ctx) => {
  await sponsorService.deleteById(Number(ctx.params.id));
  ctx.status = 204;
};

//Validation of the paramater id
deleteSponsor.validationScheme = {
  params: Joi.object({
    id: Joi.number().integer().positive().required()
  })
};

/**
 * Install sponsors routes in the given router.
 *
 * @param {Router} app - The parent router.
 */
module.exports = (app) => {//created nested route
  const router = new Router({
    prefix: '/sponsors',
  });

  //Variable assigned for admin required requests
  const requireAdmin = makeRequireRole(Role.ADMIN);

  //GET
  router.get('/', requireAuthentication, validate(getSponsors), getSponsors);
  router.get('/allInfo', requireAuthentication, validate(getAllSponsorsInfo), checkTeamId, getAllSponsorsInfo);
  router.get('/all/getAllSponsorsWithTeam', requireAuthentication, validate(getAllSponsorInfoWithTeams.validationScheme),getAllSponsorInfoWithTeams);
  router.get('/name/:name', requireAuthentication, validate(getSponsorByName.validationScheme), checkTeamId, getSponsorByName);
  router.get('/:id', requireAuthentication, validate(getSponsorById.validationScheme),checkTeamIdViaSponsor, getSponsorById);
  router.get('/team/:teamId', requireAuthentication, validate(getSponsorsFromTeam.validationScheme),checkTeamId, getSponsorsFromTeam);

  //POST
  router.post('/', requireAuthentication,requireAdmin, validate(createSponsor.validationScheme), createSponsor);

  //UPDATE (PUT)
  router.put('/:id',requireAuthentication, validate(updateSponsor.validationScheme),checkTeamIdViaSponsor, updateSponsor);

  //DELETE
  router.delete('/:id',requireAuthentication, requireAdmin, validate(deleteSponsor.validationScheme), deleteSponsor);
  
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
