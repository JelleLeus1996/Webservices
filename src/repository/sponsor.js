const {getKnex, tables} = require('../data/index');
const {getLogger} = require('../core/logging');

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
const findById = async (id) => {
  const rider = await getKnex()(tables.sponsor)
    .where('sponsorId', id)
    .first();

  return rider;
};

//GET sponsors by teamId
const findAllFromTeam = async(teamId) => {
  return await getKnex() (tables.sponsor)
    .select()
    .where('teamId',teamId)
    .orderBy('name','ASC');
};

//GET sponsor by name
const findByName = async(name) => {
  return await getKnex() (tables.sponsor)
    .select()
    .where('name', name)
    .orderBy('name','ASC');
};

//GET all sponsors without contribution
const findAllSponsorsNonFinancial = async() => {
  return await getKnex() (tables.sponsor)
    .select('sponsorId', 'name', 'industry', 'teamId')
    .orderBy('name','ASC');
};

//GET all sponsors with contribution
const findAllSponsorsWithFinancial = async() => {
  return await getKnex() (tables.sponsor)
    .select()
    .orderBy('name','ASC');
};

//GET sponsors with teams
const findAllWithTeam = async () => {
  const sponsors = await getKnex()(tables.sponsor)
    .join(tables.team, `${tables.sponsor}.teamId`, '=', `${tables.team}.teamId`)
    .select(SELECT_COLUMNS);
  return sponsors.map(formatSponsor);
};

//POST (CREATE) new sponsor
const create = async({sponsorId,name,industry,contribution,teamId}) => {
  return await getKnex()(tables.sponsor)
    .insert({sponsorId,name,industry,contribution,teamId});
};

//Update existing sponsor
const updateById = async (sponsorId, {name,industry,contribution,teamId})=>{
  try {
    await getKnex()(tables.sponsor)
      .update({name,industry,contribution,teamId})
      .where(`${tables.sponsor}.sponsorId`,sponsorId);
    return sponsorId;
  } catch (error){
    getLogger().error('Error in updateById',{error,});
    throw error;
  }
};

//DELETE sponsor by id
const deleteById = async (id) =>
{
  try {
    const rowsAffected = await getKnex()(tables.sponsor)
      .where(`${tables.sponsor}.sponsorId`,id)
      .delete();
 
    return rowsAffected > 0;
  }catch (error){
    getLogger().error('Error in deleteById',{error,});
    throw error;
  }
};

module.exports={findById, findAllFromTeam, findByName, findAllSponsorsNonFinancial, findAllSponsorsWithFinancial, findAllWithTeam, updateById, create, deleteById};