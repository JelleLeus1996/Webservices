const {getLogger} = require('../core/logging');
const {getKnex, tables} = require('../data');
 
//get table database
const findAllTeams = async() => {
  return await getKnex()(tables.team)
    .select('teamId', 'name', 'country', 'victories', 'points','team_status',
      'abbreviation', 'director', 'assistant', 'representative', 'bike','email')
    .orderBy('name','ASC');
};
const findAll = async(teamId) => {
  const teams = await getKnex()(tables.team)
    .innerJoin(tables.rider,`${tables.team}.teamId`,'=',`${tables.rider}.teamId`)
    .select(SELECT_COLUMNS)
    .where(`${tables.team}.teamId`, teamId);
 
  const budget = await getKnex()(tables.sponsor)
  .where(`${tables.sponsor}.teamId`, teamId).sum('contribution as budget');

  const riderCost = await getKnex()(tables.rider)
  .where(`${tables.rider}.teamId`, teamId).sum(getKnex().raw('monthly_wage * 12 as rider_cost'));

  const transformedTeams = teams.map(transformTeam);
  transformedTeams.forEach(team=> {
    team.budget = budget[O].budget || 0;
    team.rider_cost = riderCost[0].rider_cost || 0;
  });

  return transformedTeams;
};
const findAllTeamsInfo = async() => {
  return await getKnex()(tables.team)
    .select()
    .orderBy('name','ASC');
};
const SELECT_COLUMNS = [
  `${tables.team}.teamId AS teamId`, 'name', 'country', 'victories', `${tables.rider}.points AS rider_points`, 'team_status',
  'abbreviation', 'director', 'assistant', 'representative', 'bike', 'budget', 'overhead_cost', 'rider_cost', 'email',
  `${tables.rider}.id AS rider_id`, `${tables.rider}.nationality`, `${tables.rider}.last_name`, `${tables.rider}.first_name`,
  `${tables.rider}.birthday`, `${tables.rider}.points AS rider_points`, `${tables.rider}.monthly_wage AS wage`
];
const SELECT_COLUMNS_TEAMS = [
  `${tables.team}.teamId AS teamId`, 'name', 'country', 'victories', 'points', 'team_status',
  'abbreviation', 'director', 'assistant', 'representative', 'bike', 'budget', 'overhead_cost', 'rider_cost', 'email',
];
 
//OO mapping
const transformTeam = ({rider_id, nationality, last_name, first_name, birthday, rider_points, monthly_wage, ...rest}) =>{
  return{
    ...rest,
    riders:[{
      id: rider_id,
      nationality,
      last_name,
      first_name,
      birthday,
      points: rider_points,
      monthly_wage
    }]
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
 

 
const create = async({teamId,name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost, email, passwordHash, roles}) => {
  return await getKnex()(tables.team)
    .insert({teamId,name, country, victories, points , team_status,
      abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost,
      email, password_hash:passwordHash, roles:JSON.stringify(roles)});
};
const updateById = async (teamId, {name, country, victories, points , team_status,
  abbreviation, director, assistant, representative, bike, budget, overhead_cost, rider_cost,email})=>{
  try {
    await getKnex()(tables.team)
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
      const totalRiderCost = await getKnext()(tables.rider).where(`${tables.rider}.teamId`,team.teamId)
      .sum( {rider_cost : getKnex().raw('monthly_wage'*12) });

      return {
        ...team,
        rider_cost : totalRiderCost[0].rider_cost || 0
      };
    }));
    return teamsWithRidercost;
  }
 
module.exports={findAllTeams,findAllTeamsInfo,findById, findByName, findAll, create, findCount,updateById,deleteById, findByEmail};