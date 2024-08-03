import {Knex} from 'knex'
import {tables} from '../index'

export async function up(knex: Knex): Promise<void>{
    await knex.schema.createTable(tables.race, (table) => {
      table.increments('raceId').notNullable();
      table.string('name', 255).notNullable();
      table.date('date').notNullable();
      table.string('location', 255).notNullable();
    });
  }
export async function down(knex: Knex): Promise<void>{
    return knex.schema.dropTableIfExists(tables.race);
  }
