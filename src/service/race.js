const teamRepo = require('../repository/team');
const raceRepo = require('../repository/race')
const validation = require ('../schema/raceSchema');

const handleDBError = require ('./_handleDBError');

//GET
const getById = async (id) => {
  const race = await raceRepo.findRaceById(id);
  if (!race)
  {
    throw Error(`There is no race with id ${id}`, {id});
  }
  return race;
};

//GET by id with teams
const getByIdWithTeams = async (id) => {
    const race = await raceRepo.findRaceByIdWithTeams(id);
    if (!race)
    {
      throw Error(`There is no race with id ${id}`, {id});
    }
    return race;
  };

const getAll = async () => {
  const races = await raceRepo.findAllRaces();
  return { items: races, count:races.length };
};

//UPDATE
let newRace = [];
const updateById = async (raceId, {name, date, location}) =>
{
  const valid = validation.raceSchema.validate({raceId, name, date, location});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check if the race exists
  const existing = await raceRepo.findRaceById(id);
  if (!existing)
  {
    throw new Error('Race doesn\'t exist');
  }
  //create race
  if (typeof name === 'string')
  {
    newRace = {
        name, date, location
    };
  
  }
  const updatedRace = {
    ...newRace,
    name, date, location
  };
  try {
    await raceRepo.updateRaceById(raceId, updatedRace);
    return updatedRace;
  }catch(error){
    throw handleDBError(error);
  }
};

//CREATE
const create = async ({name, date, location}) => {
  const valid = validation.raceSchema.validate({name, date, location});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }

  try {
    const race = await raceRepo.create({
        name, date, location});
    return raceRepo.getById(race);
  }catch (error) {
    throw handleDBError(error);
  }
};

//DELETE
const deleteById = async (id) => {
  const race = await raceRepo.getById(id);

  if (!race) {
    throw new Error('Race not found');
  }
  await raceRepo.deleteRaceById(id);
  return race;
};

//Add team to a race
const postTeamToRace = async (raceId, teamId) => {
    const race = raceRepo.getById(raceId)
    if (!race) {
        throw new Error('Race not found');
      }
    const team = teamRepo.getById(teamId)
    if (!team) {
        throw new Error('Team not found');
      }
    await raceRepo.addTeamToRace(raceId, teamId)
    return [race, team]
}

const postTeamsToRace = async (raceId, teamIds) => {
    const race = raceRepo.getById(raceId)
    if (!race) {
        throw new Error('Race not found');
      }

    // Check if each team exists
    const validTeams = [];
    for (const teamId of teamIds) {
      const team = await teamRepo.getById(teamId);
      if (!team) {
        // You might want to log this error or handle it differently
        getLogger().warn(`Team with ID ${teamId} not found`);
      } else {
        validTeams.push(teamId);
      }
    }

    // If no valid teams are found
    if (validTeams.length === 0) {
      throw new Error('No valid teams found to add to the race');
    }

    // Add all valid teams to the race
    await raceRepo.addTeamsToRace(raceId, validTeams);
    
    // Return the race and the list of valid teams added
    return {
      raceId: race.raceId,
      raceName: race.name,
      teamsAdded: validTeams
    };
};

//Remove one team from a race
const deleteTeamFromRace = async (raceId, teamId) => {
    const race = raceRepo.getById(raceId)
    if (!race) {
        throw new Error('Race not found');
      }
    const team = teamRepo.getById(teamId)
    if (!team) {
        throw new Error('Team not found');
      }
    await raceRepo.removeTeamFromRace(raceId, teamId)
    return [race, team]
}

//Delete all teams from a race
const deleteAllTeamsFromRace = async (raceId) => {
    const race = raceRepo.getById(raceId)
    if (!race) {
        throw new Error('Race not found');
      }
    await raceRepo.removeAllTeamsFromRace(raceId);
    return raceId;
}

module.exports={getById, getByIdWithTeams, getAll, create, getById, updateById, deleteById, postTeamToRace, postTeamsToRace,
    deleteTeamFromRace,deleteAllTeamsFromRace
};
