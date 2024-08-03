import { Knex} from 'knex';
import { tables } from '../index'; // Adjust the import path as necessary

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(tables.team, (table) => {
    table.increments('teamId').notNullable();
    table.string('name', 255).notNullable();
    table.string('country', 255).notNullable();
    table.integer('victories');
    table.integer('points');
    table.string('team_status', 50).notNullable();
    table.string('abbreviation', 50).notNullable();
    table.string('director', 255).notNullable();
    table.string('assistant', 255);
    table.string('representative', 255);
    table.string('bike', 255).notNullable();
    table.decimal('overhead_cost', 10, 2).notNullable();
    table.unique(['name'], 'idx_team_name_unique');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(tables.team);
}