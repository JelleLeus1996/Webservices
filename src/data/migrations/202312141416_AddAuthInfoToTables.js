const {tables} = require('..');

module.exports = {
  up:async(knex)=>{
    await knex.schema.alterTable(tables.team, (table) => {
      table.string('email').notNullable();
      table.string('password_hash').notNullable();
      table.jsonb('roles').notNullable();//jsonb

      table.unique('email', 'idx_team_email_unique');
    });
  },
  down: async(knex) => {
    return knex.schema.alterTable(tables.team, table=>{
      table.dropColumns('email', 'password_hash','roles');
    });
  }
};