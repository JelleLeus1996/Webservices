const ServiceError = require('../core/serviceError');
const teamsRepo = require('../repository/team');
const validation = require ('../schema/teamSchema');
const {hashPassword} = require('../core/password');
const Role = require('../core/roles');
const {verifyPassword} = require ('../core/password');
const {generateJWT, verifyJWT} = require('../core/jwt');
const {getLogger} = require('../core/logging.js');

const handleDBError = require('./_handleDBError');
 
 
const checkAndParseSession = async (authHeader) =>{
  //check if a token is given
  if (!authHeader)
  {
    throw ServiceError.unauthorized('You need to be signed in');
  }
  //token should start with 'Bearer'
  if(!authHeader.startsWith('Bearer'))
  {
    throw ServiceError.unauthorized('Invalid authentication token');
  }
  //get token starting from 7 (after 'Bearer ')

  
  const authToken = authHeader.substring(7);
 
  try {
    const {roles, teamId} = await verifyJWT(authToken);
    return {
      teamId,
      roles,
      authToken
    };
  }catch(error){
    getLogger().error(error.message, {error});
    throw new Error(error.message);
  }
};
 
const checkRole = (role, roles) => {
  const hasPermission = roles.includes(role);
 
  if (!hasPermission){
    throw ServiceError.forbidden('you are not allowed to view this part of the application');
  }
};
 
//created limited object that you will return
const makeExposedTeam = ({teamId, name,country,victories,points,team_status, abbreviation,director, assistant,representative,bike,budget,overhead_cost,rider_cost,email, roles})=> ({teamId, name,country,victories,points,team_status, abbreviation,director, assistant,representative,bike,budget,overhead_cost,rider_cost,email, roles});

//Login
const makeLoginData = async (team) => {
  const token = await generateJWT(team);
  return {
    token,
    team:makeExposedTeam(team)
  };
};
 
const login = async(email, password)=> {
  const team = await teamsRepo.findByEmail(email);
 
  if(!team){
    throw ServiceError.unauthorized('The given email or password do not match');
  }
  const valid = await verifyPassword(password, team.password_hash);
  if(!valid){
    throw ServiceError.unauthorized('The given email or password do not match');
  }
  return await makeLoginData(team);
 
};

//GET
const getTeams = async () => {
  try {
    const teams = await teamsRepo.findAllTeams();
    console.log('Teams:',teams);
    return { items: teams.map(makeExposedTeam), count:teams.length };
  } catch (error) {
    console.error('Error in getAll service:', error);
    throw new Error('Failed to retrieve teams');
  }
};

const getAllTeamsInfo = async () => {
  try {
    const teams = await teamsRepo.findAllTeamsInfo();
    console.log('Teams:',teams);
    return { items: teams.map(makeExposedTeam), count:teams.length };
  } catch (error) {
    console.error('Error in getAll service:', error);
    throw new Error('Failed to retrieve teams');
  }
};

const getAll = async (teamId) => {
  const teams = await teamsRepo.findAll(teamId);
  return {
    items: teams.map(makeExposedTeam),
    count:teams.length,
  };
};
const getById = async (id) =>
{
  const team = await teamsRepo.findById(id);
  if (!team)
  {
    throw ServiceError.notFound(`No team with id ${id} exists`, {id});
  }
  return makeExposedTeam(team);
};
 
const getTeamByName = async (name)=>
{
  const team =  await teamsRepo.findByName(name);
  if (!team)
  {
    throw ServiceError.notFound(`No team with name ${name} exists`, {name});
  }
  return makeExposedTeam(team);
};
const create = async ({teamId, name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email, password}) =>
{
  const existingTeam = await teamsRepo.findById(teamId);
  if (existingTeam)
  {
    throw Error (`There is already a team with id ${teamId}.`, {teamId});
  }
  try {
    const passwordHash = await hashPassword(password);
    const [newTeamId] = await teamsRepo.create({teamId, name, country, victories, points , team_status,
      abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email, passwordHash, roles:[Role.TEAMREPRESENTATIVE]});
    const teamById = await getById(newTeamId);
    return teamById;
  }
  catch (error){
    throw handleDBError(error);
  }
 
};
const deleteById = async (teamId) =>
{
  const id = await getById(teamId);
  const deleted = await teamsRepo.deleteById(id);
  if (!deleted)
  {
    throw ServiceError.notFound(`No team with id ${teamId} exists`,{teamId});
  }
};
let updatedTeam = [];
const updateById = async (teamId, {name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email}) =>
{
  const valid = validation.teamSchema.validate({teamId, name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check team
  const team = teamsRepo.findById(teamId);
  if (!team)
    throw ServiceError.notFound(`No team with id ${teamId} exists`, {teamId});
  //create team
 
  updatedTeam = {
    name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email
  };
 
  const updateTeam = {
    ...updatedTeam,
    name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email
  };
 
  try {
    await teamsRepo.updateById(teamId, updateTeam);
 
    return updateTeam;
  }
  catch (error){
    throw handleDBError(error);
  }
 
};
module.exports={getTeams, getAllTeamsInfo, getAll, getById, getTeamByName,create,deleteById,updateById, login, checkAndParseSession, checkRole};