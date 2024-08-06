import { tables } from '../data/index';
import { getLogger }  from '../core/logging';
import { Knex } from 'knex';
import {Rider, Race, Team, RiderWithTeam, TeamBase} from '../types/types'

const SELECT_COLUMNS = [
  'id','nationality','last_name','first_name','birthday',`${tables.rider}.points AS rider_points`,'teamId',`${tables.team}.name AS team_name`,
  `${tables.team}.country AS team_country`,`${tables.team}.team_status AS team_status`,`${tables.team}.director AS director`,`${tables.team}.assistant AS assistant`,
  `${tables.team}.representative AS representative`,`${tables.team}.bike as bike`
];

const SELECT_COLUMNS_RACE: (keyof Race)[] = [
  'raceId', 'name', 'date', 'location'
];

type RiderTeamCombined = Rider & {
  name: string;
  country: string;
  team_status: string;
  abbreviation: string;
  director: string;
  assistant?: string;
  representative?: string;
  bike: string;
  email: string;
};
const formatRider = ({
  name,
  teamId,
  abbreviation,
  country,
  team_status,
  director,
  assistant,
  representative,
  bike,
  email,
  ...rider
}: RiderTeamCombined): RiderWithTeam => {
  return {
    ...rider,
    team: {
      teamId,
      name,
      abbreviation,
      country,
      team_status,
      director,
      assistant,
      representative,
      bike,
      email,
    },
  };
};

//get table database
export const findAll = async(knex: Knex):Promise<Race[]> => {
  return await knex(tables.rider)
    .select('id','nationality','last_name','first_name','birthday','points','teamId')
    .orderBy('last_name','ASC');
};
export const findAllRidersInfo = async(knex: Knex):Promise<Rider[]> => {
  return await knex(tables.rider)
    .select()
    .orderBy('last_name','ASC');
};
export const findByName = async(knex: Knex, first_name:string, last_name:string):Promise<Rider[]> => {
  return await knex(tables.rider)
    .select()
    .where('first_name',first_name)
    .andWhere('last_name', last_name)
    .orderBy('last_name','ASC');
};

export const findAllFromTeam = async(knex: Knex, teamId:number):Promise<Rider[]> => {
  return await knex(tables.rider)
    .select()
    .where('teamId',teamId)
    .orderBy('last_name','ASC');
};

export const findById = async (knex: Knex, riderId:number):Promise<Rider> => {
  const rider = await knex(tables.rider)
    .where('id', riderId)
    .first();
  return rider;
};
export const findAllWithTeam = async (knex: Knex):Promise<RiderWithTeam[]> => {
  const riders = await knex(tables.rider)
    .join(tables.team, `${tables.rider}.teamId`, '=', `${tables.team}.teamId`)
    .select(SELECT_COLUMNS);
  return riders.map(formatRider);
};



export const create = async(knex: Knex, {id, nationality, last_name, first_name, birthday, points, teamId, monthly_wage}) => {
  return await knex(tables.rider)
    .insert({id, nationality, last_name, first_name, birthday, points, teamId, monthly_wage});
};


export const updateById = async (knex: Knex, id:number, {nationality, last_name, first_name, birthday, points, teamId, monthly_wage})=>{
  try {
    await knex(tables.rider)
      .update({nationality, last_name, first_name, birthday, points, teamId, monthly_wage
      })
      .where(`${tables.rider}.id`,id);
    return id;
  } catch (error){
    getLogger().error('Error in updateById',{error,});
    throw error;
  }
};
 
//DELETE sponsor by id
export const deleteById = async (knex:Knex, riderId:number) =>
  {
    try {
      const rowsAffected = await knex(tables.rider)
        .where(`${tables.rider}.riderId`,riderId)
        .delete();
   
      return rowsAffected > 0;
    }catch (error){
      getLogger().error('Error in deleteById',{error,});
      throw error;
    }
  };
export default {create,updateById,findByName,findAll, findById, findAllFromTeam, findAllRidersInfo, findAllWithTeam, deleteById};