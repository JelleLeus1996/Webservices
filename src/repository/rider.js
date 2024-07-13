const {getKnex, tables} = require('../data/index');
const {getLogger} = require('../core/logging');


const SELECT_COLUMNS = [
  'id','nationality','last_name','first_name','birthday',`${tables.rider}.points AS rider_points`,'teamId',`${tables.team}.name AS team_name`,
  `${tables.team}.country AS team_country`,`${tables.team}.team_status AS team_status`,`${tables.team}.director AS director`,`${tables.team}.assistant AS assistant`,
  `${tables.team}.representative AS representative`,`${tables.team}.bike as bike`
];
const formatRider = ({
  team_name,
  teamId,
  team_country,
  team_status,
  director,
  assistant,
  representative,
  bike,
  ...rider
}) => {
  return {
    ...rider,
    team: {
      id: teamId,
      name: team_name,
      country: team_country,
      status: team_status,
      director: director,
      assistant: assistant,
      representative: representative,
      bike: bike,
    },
  };
};

//get table database
const findAll = async() => {
  return await getKnex() (tables.rider)
    .select('id','nationality','last_name','first_name','birthday','points','teamId')
    .orderBy('last_name','ASC');
};
const findAllRidersInfo = async() => {
  return await getKnex() (tables.rider)
    .select()
    .orderBy('last_name','ASC');
};
const findByName = async(first_name,last_name) => {
  return await getKnex() (tables.rider)
    .select()
    .where('first_name',first_name)
    .andWhere('last_name', last_name)
    .orderBy('last_name','ASC');
};

const findAllFromTeam = async(teamId) => {
  return await getKnex() (tables.rider)
    .select()
    .where('teamId',teamId)
    .orderBy('last_name','ASC');
};

const findById = async (id) => {
  const rider = await getKnex()(tables.rider)
    .where('id', id)
    .first();

  return rider;
};
const findAllWithTeam = async () => {
  const riders = await getKnex()(tables.rider)
    .join(tables.team, `${tables.rider}.teamId`, '=', `${tables.team}.teamId`)
    .select(SELECT_COLUMNS);
  return riders.map(formatRider);
};



const create = async({id, nationality, last_name, first_name, birthday, points, teamId, monthly_wage}) => {
  return await getKnex()(tables.rider)
    .insert({id, nationality, last_name, first_name, birthday, points, teamId, monthly_wage});
};


const updateById = async (id, {nationality, last_name, first_name, birthday, points, teamId, monthly_wage})=>{
  try {
    await getKnex()(tables.rider)
      .update({nationality, last_name, first_name, birthday, points, teamId, monthly_wage
      })
      .where(`${tables.rider}.id`,id);
    return id;
  } catch (error){
    getLogger().error('Error in updateById',{error,});
    throw error;
  }
};
 

module.exports={create,updateById,findByName,findAll, findById, findAllFromTeam, findAllRidersInfo, findAllWithTeam};