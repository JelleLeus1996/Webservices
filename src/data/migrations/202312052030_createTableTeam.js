const {tables} = require('../index');

module.exports = {
  up: async(knex) => {
    await knex.schema.createTable(tables.team,(table)=> {
      table.increments('teamId').notNullable();
      table.string('name',255).notNullable();
      table.string('country',255).notNullable();
      table.integer('victories');
      table.integer('points');
      table.string('team_status',50).notNullable();
      table.string('abbreviation',50).notNullable();
      table.string('director',255).notNullable();
      table.string('assistant',255);
      table.string('representative',255);
      table.string('bike',255).notNullable();
      table.decimal('overhead_cost',10,2).notNullable();
      table.unique('name', 'idx_team_name_unique');
    });
  },
  //no async for down, because this gives back a promise
  down: (knex) => {
    return knex.schema.dropTableIfExists(tables.team);
  },
};