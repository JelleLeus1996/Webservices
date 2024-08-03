import {Knex} from 'knex'
import {tables} from '../index'

export async function up(knex:Knex): Promise<void>{
    await knex.schema.createTable(tables.rider, (table) => {
      table.increments('id').notNullable();
      table.string('nationality',255).notNullable();
      table.string('last_name',255).notNullable();
      table.string('first_name',255).notNullable();
      table.date('birthday').notNullable();
      table.integer('points');
      table.integer('teamId').unsigned().notNullable();
      table.decimal('monthly_wage',10,2);
      table.foreign('teamId','fk_rider_team')
        .references(`${tables.team}.teamId`)
        .onDelete('RESTRICT');//if rider gets the delete, deletes also the team if you chose 'CASCADE', we chose default option 'RESTRICT'
    });
  }

  export async function down(knex:Knex): Promise<void>{
    return knex.schema.dropTableIfExists(tables.rider);
  }