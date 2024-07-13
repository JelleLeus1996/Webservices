const {join} = require('path');

const knex = require('knex'); // 👈 import knex
const config = require('config');//read from config file

const { getLogger } = require('../core/logging'); // 👈 import logging
// 👇 1 - start config

const NODE_ENV = config.get('env');
const isDevelopment = NODE_ENV === 'development';

const DATABASE_CLIENT = config.get('database.client');
const DATABASE_NAME = config.get('database.name');
const DATABASE_HOST = config.get('database.host');
const DATABASE_PORT = config.get('database.port');
const DATABASE_USERNAME = config.get('database.username');
const DATABASE_PASSWORD = config.get('database.password');

let knexInstance;
const initializeData = async() => {
  const logger = getLogger(); // 👈 9 Create logger
  logger.info('Initializing connection to the database'); // 👈 9

  // 👇 6 - start knex opties & use options from config
  const knexOptions = {
    client: DATABASE_CLIENT,
    connection: {
      host: DATABASE_HOST,
      port: DATABASE_PORT,
      //database: DATABASE_NAME,
      user: DATABASE_USERNAME,
      password: DATABASE_PASSWORD,
      insecureAuth: isDevelopment,
    },
    migrations:{
      tableName: 'knex_meta',
      directory: join ('src','data','migrations'),
    },
    seeds:{
      directory:join('src','data','seeds'),
    }
  };

  knexInstance=knex(knexOptions);
  //testing conection with database 

  try {
    await knexInstance.raw('SELECT 1+1 AS RESULT');
    await knexInstance.raw(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME}`);
    await knexInstance.destroy();
    knexOptions.connection.database=DATABASE_NAME;
    knexInstance=knex(knexOptions);
    await knexInstance.raw('SELECT 1+1 AS RESULT');
  } catch  (error){
    logger.error('Error inititializing database', {error});
    throw new Error('Could not intitialize the data layer');
  }
  try {
    await knexInstance.migrate.latest();//latest looks as the last migrations and only migrates the migrations that weren't already done yet
  }catch (error)
  {
    logger.error('migrations failed',{error});
    throw new Error ('Migrations failed');
  }

  if (isDevelopment){
    try{
      await knexInstance.seed.run();
    }catch (error){
      logger.error('Seeding failed', {error});
    }
  }
  return knexInstance;
};

async function shutdownData(){
  getLogger().info('shutting down database connection');
  await knexInstance.destroy();
  knexInstance = null;
  getLogger().info('database connection closed');
}

const getKnex = ()=>{
  if (!knexInstance)
  {
    throw new Error('Initialize database first');
  }
  return knexInstance;
};
//use object.freeze, so you freeze the tables, they can't be changed
const tables =Object.freeze({
  team:'teams',
  rider:'riders',
  sponsor:'sponsors',
  race:'races'
});

//export initialize data
module.exports={initializeData, getKnex, tables, shutdownData};