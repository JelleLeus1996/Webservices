import { tables } from '../data/index';
import { getLogger }  from '../core/logging';
import { Knex } from 'knex';
import {Sponsor, Team} from '../types/types'

//Define columns
const SELECT_COLUMNS = [
  'sponsorId', 'name', 'industry', 'contribution', 'teamId', `${tables.team}.name as team_name`];

const formatSponsor = ({
  team_name,
  teamId,
  ...sponsor
}) => {
  return {
    ...sponsor,
    team: {
      teamId: teamId,
      name: team_name,
    },
  };
};

//GET sponsor by id
export const findById = async (knex:Knex, sponsorId:number) => {
  const rider = await knex(tables.sponsor)
    .where('sponsorId', sponsorId)
    .first();

  return rider;
};

//GET sponsors by teamId
const findAllFromTeam = async(knex:Knex, teamId:number) => {
  return await knex(tables.sponsor)
    .select()
    .where('teamId',teamId)
    .orderBy('name','ASC');
};

//GET sponsor by name
const findByName = async(knex:Knex, name:string) => {
  return await knex(tables.sponsor)
    .select()
    .where('name', name)
    .orderBy('name','ASC');
};

//GET all sponsors without contribution
const findAllSponsorsNonFinancial = async(knex:Knex) => {
  return await knex(tables.sponsor)
    .select('sponsorId', 'name', 'industry', 'teamId')
    .orderBy('name','ASC');
};

//GET all sponsors with contribution
const findAllSponsorsWithFinancial = async(knex:Knex) => {
  return await knex(tables.sponsor)
    .select()
    .orderBy('name','ASC');
};

//GET sponsors with teams
const findAllWithTeam = async (knex:Knex, ) => {
  const sponsors = await knex(tables.sponsor)
    .join(tables.team, `${tables.sponsor}.teamId`, '=', `${tables.team}.teamId`)
    .select(SELECT_COLUMNS);
  return sponsors.map(formatSponsor);
};

//POST (CREATE) new sponsor
const create = async(knex:Knex, {sponsorId,name,industry,contribution,teamId}) => {
  return await knex(tables.sponsor)
    .insert({sponsorId,name,industry,contribution,teamId});
};

//Update existing sponsor
const updateById = async (knex:Knex, sponsorId:number, {name,industry,contribution,teamId})=>{
  try {
    await knex(tables.sponsor)
      .update({name,industry,contribution,teamId})
      .where(`${tables.sponsor}.sponsorId`,sponsorId);
    return sponsorId;
  } catch (error){
    getLogger().error('Error in updateById',{error,});
    throw error;
  }
};

//DELETE sponsor by id
const deleteById = async (knex:Knex, sponsorId:number) =>
{
  try {
    const rowsAffected = await knex(tables.sponsor)
      .where(`${tables.sponsor}.sponsorId`,sponsorId)
      .delete();
 
    return rowsAffected > 0;
  }catch (error){
    getLogger().error('Error in deleteById',{error,});
    throw error;
  }
};

module.exports={findById, findAllFromTeam, findByName, findAllSponsorsNonFinancial, findAllSponsorsWithFinancial, findAllWithTeam, updateById, create, deleteById};