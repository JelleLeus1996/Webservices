import { ServiceError } from '../core/serviceError';
import teamsRepo from '../repository/team';
import validation from '../schema/teamSchema';
import {hashPassword} from '../core/password';
import {Role} from '../core/roles';
import {verifyPassword} from '../core/password';
import {generateJWT, verifyJWT} from '../core/jwt';
import {getLogger} from '../core/logging.js';
import {Knex} from 'knex';

import handleDBError from './_handleDBError';
import {Team} from '../types/types'

interface Session {
  teamId: number;
  roles: string;
  authToken: string;
}

const checkAndParseSession = async (authHeader: string | undefined): Promise<Session> =>{
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
 
const checkRole = (role: string, roles: string[]) => {
  const hasPermission = roles.includes(role);
  if (!hasPermission){
    throw ServiceError.forbidden('you are not allowed to view this part of the application');
  }
};
 
//created limited object that you will return
const makeExposedTeam = (team: Team): Team => {
  const { password, password_hash, ...exposedTeam} =  team;
  return exposedTeam as Team
};

//Login
const makeLoginData = async (team: Team):Promise<{token:string; team:Team}> => {
  const token = await generateJWT(team);
  return {
    token,
    team:makeExposedTeam(team)
  };
};
 
const login = async(knex: Knex, email:string , password:string): Promise<{token:string; team:Team}> => {
  const team = await teamsRepo.findByEmail(knex, email);
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
const getTeams = async (knex: Knex): Promise<{ items: Team[]; count: number }> => {
  try {
    const teams = await teamsRepo.findAllTeams(knex);
    console.log('Teams:',teams);
    return { items: teams.map(makeExposedTeam), count:teams.length };
  } catch (error) {
    console.error('Error in getAll service:', error);
    throw new Error('Failed to retrieve teams');
  }
};

const getAllTeamsInfo = async (knex: Knex): Promise<{ items: Team[]; count: number }> => {
  try {
    const teams = await teamsRepo.findAllTeamsInfo(knex);
    console.log('Teams:',teams);
    return { items: teams.map(makeExposedTeam), count:teams.length };
  } catch (error) {
    console.error('Error in getAll service:', error);
    throw new Error('Failed to retrieve teams');
  }
};

const getAll = async (knex: Knex): Promise<{ items: Team[]; count: number }> => {
  const teams = await teamsRepo.findAllTeams(knex);
  return {
    items: teams.map(makeExposedTeam),
    count:teams.length,
  };
};
const getById = async (knex: Knex, id: number): Promise<Team> =>
{
  const team = await teamsRepo.findById(knex, id);
  if (!team)
  {
    throw ServiceError.notFound(`No team with id ${id} exists`, {id});
  }
  return makeExposedTeam(team);
};
 
const getTeamByName = async (knex: Knex, name: string): Promise<Team> =>
{
  const team =  await teamsRepo.findByName(knex, name);
  if (!team)
  {
    throw ServiceError.notFound(`No team with name ${name} exists`, {name});
  }
  return makeExposedTeam(team);
};
const create = async (knex: Knex, input: Omit<Team, 'roles'> & { password: string }): Promise<Team> =>
{
  const { teamId } = input;
  const existingTeam = await teamsRepo.findById(knex, teamId);
  if (existingTeam)
  {
    throw Error (`There is already a team with id ${teamId}.`);
  }
  try {
    const passwordHash = await hashPassword(input.password);
    const [newTeamId] = await teamsRepo.create(knex, {teamId, name, country, victories, points , team_status,
      abbreviation, director, assistant, representative, bike, overhead_cost, email, passwordHash, roles:[Role.TEAMREPRESENTATIVE]});
    const teamById = await getById(knex, newTeamId);
    return teamById;
  }
  catch (error){
    throw handleDBError(error);
  }
 
};
const deleteById = async (knex: Knex, teamId: number): Promise<void> =>
{
  const id = await getById(knex, teamId);
  const deleted = await teamsRepo.deleteById(knex, teamId);
  if (!deleted)
  {
    throw ServiceError.notFound(`No team with id ${teamId} exists`,{teamId});
  }
};
let updatedTeam: Partial<Team> = {};
const updateById = async (knex: Knex, teamId: number, {name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, overhead_cost, email}) =>
{
  const valid = validation.teamSchema.validate({teamId, name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, overhead_cost});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check team
  const team = teamsRepo.findById(knex, teamId);
  if (!team)
    throw ServiceError.notFound(`No team with id ${teamId} exists`, {teamId});
  //create team
 
  updatedTeam = {
    name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, overhead_cost, email
  };
 
  const updateTeam = {
    ...updatedTeam,
    name, country, victories, points , team_status,
    abbreviation, director, assistant, representative, bike, overhead_cost, email
  };
 
  try {
    await teamsRepo.updateById(knex, teamId, updateTeam);
 
    return updateTeam;
  }
  catch (error){
    throw handleDBError(error);
  }
 
};
export default {getTeams, getAllTeamsInfo, getAll, getById, getTeamByName,create,deleteById,updateById, login, checkAndParseSession, checkRole};