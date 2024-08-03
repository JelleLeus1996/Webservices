import {Knex} from 'knex'
import {tables} from '../index'

export async function up(knex: Knex): Promise<void>{
    await knex.schema.alterTable(tables.team, (table) => {
      table.string('email').notNullable();
      table.string('password_hash').notNullable();
      table.jsonb('roles').notNullable();//jsonb

      table.unique('email', 'idx_team_email_unique');
    });
  }
  export async function down(knex: Knex): Promise<void>{{
    return knex.schema.alterTable(tables.team, table=>{
      table.dropColumns('email', 'password_hash','roles');
    });
  }
};