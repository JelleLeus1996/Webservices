import {Knex} from 'knex';
import {tables} from '../data';
import {getLogger} from '../core/logging';
import {Race, TeamWithSponsorsAndRaces, Team, Rider, Sponsor, TeamWithRiders} from '../types/types'

const SELECT_COLUMNS_TEAMS = [
  `${tables.team}.teamId AS teamId`, 'name', 'country', 'victories', `${tables.team}.points AS teamPoints`,'team_status',
      'abbreviation', 'director', 'assistant', 'representative', 'bike','email'
];

const SELECT_COLUMNS = [
  `${tables.team}.teamId AS teamId`, 'name', 'country', 'victories', `${tables.rider}.points AS rider_points`, 'team_status',
  'abbreviation', 'director', 'assistant', 'representative', 'bike', 'overhead_cost', 'email',
  `${tables.rider}.id AS rider_id`, `${tables.rider}.nationality`, `${tables.rider}.last_name`, `${tables.rider}.first_name`,
  `${tables.rider}.birthday`, `${tables.rider}.points AS rider_points`, `${tables.rider}.monthly_wage AS wage`
];

//get basic team data of all teams
export const findAllTeams = async (knex: Knex): Promise<Team[]> => {
  return knex(tables.team)
    .select(SELECT_COLUMNS_TEAMS)
    .orderBy('name','ASC');
};
export const findAllTeamData = async(knex: Knex): Promise<Team[]> => {
  // Get all teams with basic info
  const teams = await knex(tables.team)
    .select(SELECT_COLUMNS)
    .orderBy('name', 'ASC');

  // Get the sponsors & races for each team
  const teamWithDetails: Team[] = await Promise.all(teams.map(async (team): Promise<Team> => {
    // Get sponsors for the team
    const sponsors: Sponsor[] = await knex(tables.sponsor)
      .select('sponsorId', 'name', 'industry', 'contribution')
      .where('teamId', team.teamId);

    // Get races for the team
    const races: Race[] = await knex(tables.race)
      .select('raceId', 'name', 'date', 'location')
      .join(tables.race_teams, `${tables.race}.raceId`, `${tables.race_teams}.raceId`)
      .where(`${tables.race_teams}.teamId`, team.teamId);

    return {
      ...team,
      sponsors,
      races,
    };
  }));

  return teamWithDetails;
};

//get all team data of all teams
export const findTeamsWithRiders = async (knex: Knex, teamId: number): Promise<Team | null> => {
  // Get team data for the specified teamId
  const team: Team | undefined = await knex(tables.team)
    .where(`${tables.team}.teamId`, teamId)
    .first(SELECT_COLUMNS);

  if (!team) {
    return null;
  }

  // Get sponsors for the team to calculate the budget
  const sponsors = await knex(tables.sponsor)
    .where('teamId', teamId)
    .sum('contribution as budget');

  // Get riders for the team to calculate the rider cost
  const riders = await knex(tables.rider)
    .where('teamId', teamId)
    .sum(knex.raw('monthly_wage * 12 as rider_cost'));

  // Transform the team data to include riders, budget, and rider cost
  const transformedTeam : Team = transformTeam(team);
  transformedTeam.budget = sponsors[0]?.budget || 0;
  transformedTeam.rider_cost = riders[0]?.rider_cost || 0;

  return transformedTeam;
};

const findAllTeamsInfo = async() => {
  return await getKnex()(tables.team)
    .select()
    .orderBy('name','ASC');
};
 
//OO mapping
export const transformTeam = ({
  rider_id, 
  nationality, 
  last_name, 
  first_name, 
  birthday, 
  rider_points, 
  monthly_wage, 
  ...rest
}: any): TeamWithRiders =>{
  // Create a Rider object
  const rider: Rider = {
    id: rider_id,
    nationality,
    last_name,
    first_name,
    birthday,
    points: rider_points,
    monthly_wage,
  };
  // Return the transformed team with the rider
  return {
    ...rest,
    riders: [rider],
  };
};

const findById=async(id) => {
  const riders = await getKnex()(tables.team)
    .where(`${tables.team}.teamId`, id)
    .first(SELECT_COLUMNS_TEAMS);
  return riders;
};
const findByName=async(name) => {
  const riders = await getKnex()(tables.team)
    .where(`${tables.team}.name`, name)
    .first(SELECT_COLUMNS_TEAMS);
  return riders;
};


const findCount = async () =>{
  const [count] = await getKnex()(tables.team).count();
  return count['count(*)'];
};
 

 
export const create = async (knex: Knex, teamData: Omit<Team, 'teamId'>): Promise<number[]> =>{
  return knex(tables.team).insert({
    name:teamData.name,
    country:teamData.country,
    victories:teamData.victories,
    points:teamData.points,
    team_status:teamData.team_status,
    abbreviation:teamData.abbreviation,
    director:teamData.director,
    assistant:teamData.assistant,
    representative:teamData.representative,
    bike:teamData.bike,
    overhead_cost:teamData.overhead_cost,
    email:teamData.email,
    passwordHash:teamData.password_hash,
    roles: JSON.stringify(teamData.roles),
  });
};
  
const updateById = async (teamId, {name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost,email})=>{
  try {
    await knex()(tables.team)
      .update({name, country, victories, points , team_status,
        abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost,email
      })
      .where(`${tables.team}.teamId`,teamId);
    return teamId;
  } catch (error){
    getLogger().error('Error in updateById',{error,});
    throw error;
  }
};
 
const deleteById = async (id) =>
{
  try {
    const rowsAffected = await getKnex()(tables.team)
      .where(`${tables.team}.teamId`,id)
      .delete();
 
    return rowsAffected > 0;
  }catch (error){
    getLogger().error('Error in deleteById',{error,});
    throw error;
  }
};
const findByEmail = (email) => {
  return getKnex()(tables.team).where('email', email).first();
};

const findAllTeamsWithFinancials = async () => {
  const teamsWithBudget = await getKnex()(tables.team)
    .select(
      `${tables.team}.teamId`,
      'name',
      'country',
      'victories',
      'points',
      'team_status',
      'abbreviation',
      'director',
      'assistant',
      'representative',
      'bike',
      'email').sum({ budget:`${tables.sponsor}.contribution`})
    .leftJoin(tables.sponsor, `${tables.team}.teamId`, `${tables.sponsor}.teamId`)
    .groupBy(`${tables.team}.teamId`)
    .orderBy('name', 'ASC');

  const teamsWithRidercost = await Promise.all(teamsWithBudget.map(async(team)=>{
    const totalRiderCost = await knex(tables.rider)
      .where(`${tables.rider}.teamId`,team.teamId)
      .sum( {rider_cost : getKnex().raw('monthly_wage'*12) });
    return {
      ...team,
      rider_cost : totalRiderCost[0].rider_cost || 0
    };
  }));
  return teamsWithRidercost;
};
 
export default {findAllTeamData, findAllTeams,findAllTeamsInfo,findById, findByName, findTeamsWithRiders, create, findCount,updateById,deleteById, findByEmail, findAllTeamsWithFinancials};