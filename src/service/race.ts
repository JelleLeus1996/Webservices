import * as teamRepo from '../repository/team';
import * as raceRepo from '../repository/race';
import handleDBError from './_handleDBError';
import { Knex } from 'knex';
import { Race } from '../types/types';
import raceSchema from '../schema/raceSchema'
import validation from '../schema/raceSchema';

//GET
const getById = async (knex: Knex, raceId: number): Promise<Race> => {
  const race = await raceRepo.findRaceById(knex, raceId);
  if (!race)
  {
    throw Error(`There is no race with id ${raceId}`);
  }
  return race;
};

//GET by id with teams
const getByIdWithTeams = async (knex: Knex, raceId: number) => {
  const race = await raceRepo.findRaceByIdWithTeams(knex,raceId);
  if (!race)
  {
    throw Error(`There is no race with id ${raceId}`);
  }
  return race;
};

const getAll = async (knex: Knex) => {
  const races = await raceRepo.findAllRaces(knex);
  return { items: races, count:races.length };
};

//UPDATE
let newRace = [];
const updateById = async (knex: Knex, raceId: number, {name, date, location}):Promise<Race> =>
{
  const valid =  validation.raceSchema.validate({raceId, name, date, location});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check if the race exists
  const existing = await raceRepo.findRaceById(knex, raceId);
  if (!existing)
  {
    throw new Error('Race doesn\'t exist');
  }
  //create race
  if (typeof name === 'string')
  {
    newRace = [{
      raceId, name, date, location
    }];
  
  }
  const updatedRace = {
    ...newRace,
    raceId, name, date, location
  };
  try {
    await raceRepo.updateRaceById(knex, raceId, updatedRace);
    return updatedRace;
  }catch(error){
    throw handleDBError(error);
  }
};

//CREATE
const create = async (knex:Knex,{name, date, location}) => {
  const valid = validation.raceSchema.validate({name, date, location});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }

  try {
    const race = await raceRepo.create(knex,{
      name, date, location});
    return raceRepo.findRaceById(knex, race);
  }catch (error) {
    throw handleDBError(error);
  }
};

//DELETE
const deleteById = async (knex: Knex, id: number) => {
  const race = await raceRepo.findRaceById(knex, id);

  if (!race) {
    throw new Error('Race not found');
  }
  await raceRepo.deleteRaceById(knex, id);
  return race;
};

//Add team to a race
const postTeamToRace = async (knex: Knex, raceId: number, teamId: number) => {
  const race = raceRepo.findRaceById(knex, raceId);
  if (!race) {
    throw new Error('Race not found');
  }
  const team = teamRepo.findById(knex, teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  await raceRepo.addTeamToRace(knex, raceId, teamId);
  return [race, team];
};

const postTeamsToRace = async (knex: Knex, raceId: number, teamIds: number[]) => {
  const race = raceRepo.findRaceById(knex, raceId);
  if (!race) {
    throw new Error('Race not found');
  }
  // Check if each team exists
  const validTeams = [];
  for (const teamId of teamIds) {
    const team = await teamRepo.findById(knex, teamId);
    if (!team) {
      // You might want to log this error or handle it differently
      throw new Error(`Team with ID ${teamId} not found`);
    } else {
      validTeams.push(teamId);
    }
  }
  // If no valid teams are found
  if (validTeams.length === 0) {
    throw new Error('No valid teams found to add to the race');
  }

  // Add all valid teams to the race
  await raceRepo.addTeamsToRace(knex, raceId, validTeams);
  
  // Return the race and the list of valid teams added
  return {
    raceId: (await race).raceId,
    raceName: (await race).name,
    teamsAdded: validTeams
  };
};

//Remove one team from a race
const deleteTeamFromRace = async (knex: Knex, raceId: number, teamId: number) => {
  const race = raceRepo.findRaceById(knex, raceId);
  if (!race) {
    throw new Error('Race not found');
  }
  const team = teamRepo.findById(knex, teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  await raceRepo.removeTeamFromRace(knex, raceId, teamId);
  return [race, team];
};

//Delete all teams from a race
const deleteAllTeamsFromRace = async (knex: Knex, raceId: number) => {
  const race = raceRepo.findRaceById(knex, raceId);
  if (!race) {
    throw new Error('Race not found');
  }
  await raceRepo.removeAllTeamsFromRace(knex, raceId);
  return raceId;
};

export default {getById, getByIdWithTeams, getAll, create, updateById, deleteById, postTeamToRace, postTeamsToRace,
  deleteTeamFromRace,deleteAllTeamsFromRace
};
