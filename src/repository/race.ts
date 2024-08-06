import { tables} from '../data/index';
import {getLogger}  from '../core/logging';
import { Knex } from 'knex';
import {Race, Team, BasicTeamInfo, RaceWithTeams} from '../types/types'


// Define columns for race
const SELECT_COLUMNS_RACE: (keyof Race)[] = [
  'raceId', 'name', 'date', 'location'
];

// Define columns for race_team
const SELECT_COLUMNS_RACE_TEAM: (keyof Team)[]= [
  'teamId','name'
];

//Format race with teams
const formatRaceWithTeams = (race: Race, teams: BasicTeamInfo[]): RaceWithTeams => {
  return {
    ...race,
    teams: teams.map(team => ({
      teamId: team.teamId,
      name:team.name,
    })),
  };
};


//GET all races
export const findAllRaces = async(knex: Knex):Promise<Race[]> => {
  return knex(tables.race)
    .select(SELECT_COLUMNS_RACE)
    .orderBy('date','ASC');
};

//GET race by ID
export const findRaceById = async(knex:Knex, raceId:number):Promise<Race> => {
  const race = await knex(tables.race)
    .where('raceId', raceId)
    .select(SELECT_COLUMNS_RACE)
    .first();
  return race || null;
};


//GET race by ID with associated teams
export const findRaceByIdWithTeams = async(knex:Knex, raceId:number):Promise<(Race & {teams:BasicTeamInfo[]}) | null> => {
  const race = await knex(tables.race)
    .where('raceId',raceId)
    .first(SELECT_COLUMNS_RACE);

  if (!race)
  {
    return null;
  }
  const teams = await knex(tables.race_team)
    .join(tables.team, `${tables.race_team}.teamId`, '=', `${tables.team}.teamId`)
    .where(`${tables.race_team}.raceId`,raceId)
    .select(SELECT_COLUMNS_RACE_TEAM);

  return formatRaceWithTeams(race, teams);
};

//POST (CREATE) new race
export const create = async(knex: Knex, {name, date, location}: Omit<Race, 'raceId'>):Promise<number> => {
  const [raceId] = await knex(tables.race)
    .insert({name, date, location})
    .returning('raceId');
  return raceId;
};

//Update existing race
export const updateRaceById = async (knex: Knex, raceId:number, {name, date, location}:Omit<Race,'raceId'>):Promise<number>=>{
  try {
    await knex(tables.race)
      .update({name, date, location})
      .where('raceId',raceId);
    return raceId;
  } catch (error){
    getLogger().error('Error in updateRaceById',{error,});
    throw error;
  }
};

//DELETE sponsor by id
export const deleteRaceById = async (knex:Knex, raceId: number):Promise<boolean> =>
{
  try {
    const rowsAffected = await knex(tables.race)
      .where(`${tables.race}.raceId`,raceId)
      .delete();
    return rowsAffected > 0;
  }catch (error){
    getLogger().error('Error in deleteRaceById',{error,});
    throw error;
  }
};

// Add one team to a race
export const addTeamToRace = async (knex: Knex, raceId: number, teamId:number):Promise<void> => {
  const exists = await knex(tables.race_team)
    .where({ raceId, teamId })
    .first();

  if (!exists) {
    await knex(tables.race_team)
      .insert({ raceId, teamId });
  }
};
  
// Add multiple teams to a race
export const addTeamsToRace = async (knex: Knex, raceId: number, teamIds: number[]):Promise<void> => {
  const promises = teamIds.map(teamId => addTeamToRace(knex,raceId, teamId));
  await Promise.all(promises);
};
  
// Remove one team from a race
export const removeTeamFromRace = async (knex: Knex, raceId:number, teamId:number):Promise<void> => {
  await knex(tables.race_team)
    .where({ raceId, teamId })
    .delete();
};
  
// Remove all teams from a race
export const removeAllTeamsFromRace = async (knex: Knex, raceId:number):Promise<void> => {
  await knex(tables.race_team)
    .where({ raceId })
    .delete();
};

export default {findRaceById,  findRaceByIdWithTeams, findAllRaces, create, updateRaceById,  deleteRaceById, removeTeamFromRace, removeAllTeamsFromRace, addTeamToRace, addTeamsToRace};