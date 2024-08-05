import {Knex} from 'knex'
import {tables} from '../index'

export async function up(knex: Knex): Promise<void>{
    await knex.schema.createTable(tables.race_team, (table) => {
      table.increments('id').notNullable(); // Optional primary key for the junction table
      table.integer('raceId').unsigned().notNullable();
      table.integer('teamId').unsigned().notNullable();
      // Foreign key for the race table
      table.foreign('raceId', 'fk_race_team_race')
        .references(`${tables.race}.raceId`)
        .onDelete('RISTRICT');
      // Foreign key for the team table
      table.foreign('teamId', 'fk_race_team_team')
        .references(`${tables.team}.teamId`)
        .onDelete('RISTRICT'); // if a race or team is deleted, these entries of the junction table should be deleted as well
      // Add unique constraint to prevent duplicate race-team entries
      table.unique(['raceId', 'teamId'], 'idx_race_team_unique');
    });
  }
