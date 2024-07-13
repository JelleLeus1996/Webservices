const { tables } = require('..');


// Functie om 4 willekeurige continentale teams te kiezen
function getRandomContinentalTeamIds(excludeIds, numberOfTeams){
    const contiTeamIds = [17,18,19,20,21,22]
    const filterIds = contiTeamIds.filter(id=>!excludeIds.includes(id));
    let selectedIds = [];
    while (selectedIds.length < numberOfTeams)
    {
      const randomIndex = Math.floor(Math.random()*filterIds.length);
      selectedIds.push(filterIds.splice(randomIndex,1)[0])
    }
    return selectedIds
  }
  
module.exports = {
  seed: async(knex)=>{
    // First delete all entries
    await knex(tables.race_teams).del();

    // Generate race_teams data
    const raceTeamsData = [];
    for (let raceId = 1; raceId <= 30; raceId++) {
      const worldTourTeamIds = Array.from({ length: 16 }, (_, i) => i + 1);
      const continentalTeamIds = getRandomContinentalTeamIds([23], 4);
      const teamIds = worldTourTeamIds.concat(continentalTeamIds);

      teamIds.forEach(teamId => {
        raceTeamsData.push({
          raceId: raceId,
          teamId: teamId
        });
      });
    }

    // Add data
    await knex(tables.race_teams).insert(raceTeamsData);
  }
};
