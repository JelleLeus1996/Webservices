import ridersRepo from '../repository/rider';
import teamRepo from '../repository/team';
import validation from '../schema/riderSchema';
import Knex from 'knex'
import handleDBError from './_handleDBError';

//GET
const getById = async (knex: Knex, id:number) => {
  const rider = await ridersRepo.findById(knex, id);
  if (!rider)
  {
    throw Error(`There is no rider with id ${id}`, {id});
  }
  return rider;
};

const getAll = async () => {
  const riders = await ridersRepo.findAll();
  return { items: riders, count:riders.length };
};

const getAllRidersInfo = async () => {
  const riders = await ridersRepo.findAllRidersInfo();
  return { items: riders, count:riders.length };
};
const getRiderByFullName = async (first_name: string, last_name: string) =>
{
  const rider = await ridersRepo.findByName(first_name,last_name);
  if (!rider)
  {
    throw Error(`There is no rider called ${first_name} ${last_name}`, {first_name}, {last_name});
  }
  return rider;
};

const getRidersFromTeam = async(teamId: number) => {
  const riders = await ridersRepo.findAllFromTeam(teamId);
  if (!riders)
  {
    throw Error(`There is no team with teamId ${teamId}`, {teamId});
  }
  return { items: riders, count:riders.length};
};
const getAllWithTeam = async () => {
  const items = await ridersRepo.findAllWithTeam();
  return {
    items,
    count: items.length,
  };
};

//UPDATE
let newRider = [];
const updateById = async (id: number, {nationality, last_name, first_name, birthday, points, teamId, monthly_wage}) =>
{
  const valid = validation.riderSchema.validate({id, nationality, last_name, first_name, teamId, birthday, points, monthly_wage});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check if the rider exists
  const existing = await ridersRepo.findById(id);
  if (!existing)
  {
    throw new Error('Rider doesn\'t exist');
  }
  //Check team
  const team = await teamRepo.findById(teamId);
  if (!team)
    throw new Error ('Team does not exist');
  //create rider
  if (typeof last_name === 'string')
  {
    newRider = {
      nationality, last_name, first_name, birthday, points, teamId, monthly_wage
    };
  
  }
  const updatedRider = {
    ...newRider,
    nationality,
    last_name,
    first_name,
    birthday,
    points,
    teamId,
    monthly_wage,
  };
  try {
    await ridersRepo.updateById(id, updatedRider);
    return updatedRider;
  }catch(error){
    throw handleDBError(error);
  }
};

//CREATE
const create= async ({id, nationality, last_name, first_name, birthday, points, teamId, monthly_wage}) => {
  const valid = validation.riderSchema.validate({id, nationality, last_name, first_name, teamId, birthday, points, monthly_wage});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }

  const team = await teamRepo.findById(t=>t.teamId===teamId);
  if (!team)
    throw new Error ('Team does not exist');
  try {
    const rider = await ridersRepo.create({
      id, 
      nationality, 
      last_name, 
      first_name, 
      teamId, 
      birthday, 
      points,
      monthly_wage});
    return getById(rider);
  }catch (error) {
    throw handleDBError(error);
  }
};

//DELETE
const deleteById = async (id: number) => {
  const rider = getById(id);

  if (!rider) {
    throw new Error('Rider not found');
  }
  await ridersRepo.deleteById(id);
  return rider;
};

export default {getAll, getAllWithTeam, getRiderByFullName, getRidersFromTeam, getAllRidersInfo, create, getById, updateById, deleteById};
