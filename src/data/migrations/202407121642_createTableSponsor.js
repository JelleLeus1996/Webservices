const {tables} = require('../index');

module.exports = {
  up: async(knex) => {
    await knex.schema.createTable(tables.sponsor, (table) => {
      table.increments('sponsorId').notNullable();
      table.string('name',255).notNullable();
      table.string('industry',255).notNullable();
      table.integer('contribution');
      table.integer('teamId').unsigned().notNullable();
      table.foreign('teamId','fk_sponsor_team')
        .references(`${tables.team}.teamId`)
        .onDelete('RESTRICT');//if rider gets the delete, deletes also the team if you chose 'CASCADE', we chose default option 'RESTRICT'
    });
  },
  down:(knex) => {
    return knex.schema.dropTableIfExists(tables.sponsor);
  }
};