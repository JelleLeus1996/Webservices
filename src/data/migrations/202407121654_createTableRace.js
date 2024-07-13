const { tables } = require('../index');

module.exports = {
  up: async (knex) => {
    await knex.schema.createTable(tables.race, (table) => {
      table.increments('raceId').notNullable();
      table.string('name', 255).notNullable();
      table.date('date').notNullable();
      table.string('location', 255).notNullable();
    });
  },
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.race);
  }
};
