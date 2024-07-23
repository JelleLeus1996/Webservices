const {getKnex, tables} = require('../data/index');
const {getLogger} = require('../core/logging');

// Define columns for race
const SELECT_COLUMNS_RACE = [
    'raceId', 'name', 'date', 'location'
];

// Define columns for race_teams
const SELECT_COLUMNS_RACE_TEAMS = [
  `${tables.race_teams}.raceId`, `${tables.race_teams}.teamId`, `${tables.team}.name as team_name`
];

//Format race with teams
const formatRaceWithTeams = (race, teams) => {
    return {
        ...race,
        teams: teams.map(team => ({
            teamId: team.teamId,
            name:team.name,
        })),
    };
};


//GET all races
const findAllRaces = async() => {
  return await getKnex() (tables.race)
    .select(SELECT_COLUMNS_RACE)
    .orderBy('date','ASC');
};

//GET race by ID
const findRaceById = async(raceId) => {
  const race = await getKnex()(tables.race)
  .where('raceId', raceId)
  .select(SELECT_COLUMNS_RACE);
  if (!race)
    {
        return null;
    }
}


//GET race by ID with associated teams
const findRaceByIdWithTeams = async(raceId) => {
    const race = await getKnex()(tables.race)
    .where('raceId',raceId)
    .first(SELECT_COLUMNS_RACE);

    if (!race)
    {
        return null;
    }
 const teams = await getKnex()(tables.race_teams)
    .join(tables.team, `${table.race_teams}.teamId`, '=', `${table.team}.teamId`)
    .where(`${tables.race_teams}.raceId`,raceId)
    .select(SELECT_COLUMNS_RACE_TEAMS);

 return formatRaceWithTeams(race, teams);
};

//POST (CREATE) new race
const create = async({name, date, location}) => {
    const [raceId] = await getKnex()(tables.race)
    .insert({name, date, location})
    .returning('raceId');

    return raceId;
};

//Update existing race
const updateRaceById = async (raceId, {name, date, location})=>{
  try {
    await getKnex()(tables.race)
      .update({name, date, location})
      .where('raceId',raceId);
    return raceId;
  } catch (error){
    getLogger().error('Error in updateRaceById',{error,});
    throw error;
  }
};

//DELETE sponsor by id
const deleteRaceById = async (id) =>
    {
      try {
        const rowsAffected = await getKnex()(tables.race)
          .where(`${tables.race}.raceId`,id)
          .delete();
     
        return rowsAffected > 0;
      }catch (error){
        getLogger().error('Error in deleteRaceById',{error,});
        throw error;
      }
    };

// Add one team to a race
const addTeamToRace = async (raceId, teamId) => {
    const exists = await getKnex()(tables.race_teams)
      .where({ raceId, teamId })
      .first();
  
    if (!exists) {
      await getKnex()(tables.race_teams)
        .insert({ raceId, teamId });
    }
  };
  
// Add multiple teams to a race
const addTeamsToRace = async (raceId, teamIds) => {
  const promises = teamIds.map(teamId => addTeamToRace(raceId, teamId));
  await Promise.all(promises);
  };
  
// Remove one team from a race
const removeTeamFromRace = async (raceId, teamId) => {
  await getKnex()(tables.race_teams)
    .where({ raceId, teamId })
    .delete();
};
  
// Remove all teams from a race
const removeAllTeamsFromRace = async (raceId) => {
  await getKnex()(tables.race_teams)
    .where({ raceId })
    .delete();
};

module.exports={findRaceById,  findRaceByIdWithTeams, findAllRaces, create, updateRaceById,  deleteRaceById, removeTeamFromRace, removeAllTeamsFromRace, addTeamToRace, addTeamsToRace};