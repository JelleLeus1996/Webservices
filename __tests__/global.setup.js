const config = require('config'); // 👈 2

const { initializeLogger } = require('../src/core/logging'); // 👈 2
const Role = require('../src/core/roles'); // 👈 4
const { initializeData, getKnex, tables } = require('../src/data'); // 👈 3 en 4
 
// 👇 1
module.exports = async () => {
  // Create a database connection
  // 👇 2<
  initializeLogger({
    level: config.get('logging.level'),
    disabled: config.get('logging.disabled'),
  });
  await initializeData(); // 👈 3
 
  // Insert a test user with password 12345678
  const knex = getKnex(); // 👈 3
 
  // 👇 4
  await knex(tables.team).insert([
    {
      teamId:1,
      name:'Canyon//SRAM Racing',
      country:'Germany',
      victories:8,
      points:5710,
      team_status:'WTW',
      abbreviation:'CSR',
      director:'Ronny Lauke',
      assistant:'Beth Duryea',
      representative:'Magnus Bäckstedt',
      bike:'Canyon',
      overhead_cost:6500000.00,
      email: 'Magnus.Bäckstedt@hotmail.com',
      password_hash: '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
      roles: JSON.stringify([Role.TEAMREPRESENTATIVE])
    },
    {
      teamId:23, name:'Union Cycliste Internationale',
      country:'Switzerland',
      victories:0,
      points:0,
      team_status:'UCI',
      abbreviation:'UCI',
      director:'David Lappartient',
      assistant:'Adam Hansen',
      representative:'Jelle Leus',
      bike:'Shimano',
      overhead_cost:60000000,
      email: 'jelle.leus@student.hogent.be',
      password_hash: '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
      roles: JSON.stringify([Role.TEAMREPRESENTATIVE,Role.ADMIN])
    },
  ]);
};