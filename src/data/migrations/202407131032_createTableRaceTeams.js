const { tables } = require('../index');

module.exports = {
    up: async (knex) => {
    await knex.schema.createTable(tables.race_teams, (table) => {
      table.increments('id').notNullable(); // Optional primary key for the junction table
      table.integer('raceId').unsigned().notNullable();
      table.integer('teamId').unsigned().notNullable();
      // Foreign key for the race table
      table.foreign('raceId', 'fk_race_teams_race')
        .references(`${tables.race}.raceId`)
        .onDelete('CASCADE');
    // Foreign key for the team table
      table.foreign('teamId', 'fk_race_teams_team')
        .references(`${tables.team}.teamId`)
        .onDelete('CASCADE'); // if a race or team is deleted, these entries of the junction table should be deleted as well
      // Add unique constraint to prevent duplicate race-team entries
      table.unique(['raceId', 'teamId'], 'idx_race_teams_unique');
    });
  }
  
};