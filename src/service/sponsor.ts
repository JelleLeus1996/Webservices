import teamRepo from '../repository/team';
import sponsorRepo from '../repository/sponsor';
import validation from '../schema/sponsorSchema';
import { Knex } from 'knex';
import handleDBError from './_handleDBError';

//GET sponsor by id
const getById = async (knex: Knex, id: number) => {
  const sponsor = await sponsorRepo.findById(knex, id);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with id ${id}`);
  }
  return sponsor;
};

//GET sponsors by teamId
const getByTeamId = async (knex: Knex, id: number) => {
  const sponsor = await sponsorRepo.findAllFromTeam(knex, id);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with id ${id}`);
  }
  return sponsor;
};
  
//GET sponsor by teamId
const getByName = async (knex: Knex, name: string) => {
  const sponsor = await sponsorRepo.findByName(knex, name);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with the name ${name}`);
  }
  return sponsor;
};

const getAll = async (knex: Knex) => {
  const sponsors = await sponsorRepo.findAllSponsorsNonFinancial(knex);
  return { items: sponsors, count:sponsors.length };
};

const getAllWithFinancials = async (knex: Knex) => {
  const sponsors = await sponsorRepo.findAllSponsorsWithFinancial(knex);
  return { items: sponsors, count:sponsors.length };
};

const getAllWithTeams = async(knex: Knex) => {
  const sponsors = await sponsorRepo.findAllWithTeam(knex);
  return { items: sponsors, count:sponsors.length};
};

//UPDATE
let newSponsor = [];
const updateById = async (knex: Knex, sponsorId: number, {name,industry,contribution,teamId}) =>
{
  const valid = validation.sponsorSchema.validate({sponsorId,name,industry,contribution,teamId});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check if the sponsor exists
  const existing = await sponsorRepo.findById(knex, sponsorId);
  if (!existing)
  {
    throw new Error('Sponsor doesn\'t exist');
  }
  //Check team
  const team = await teamRepo.findById(knex, teamId);
  if (!team)
    throw new Error ('Team does not exist');
  //create sponsor
  if (typeof name === 'string')
  {
    newSponsor = {
      name,industry,contribution,teamId
    };
  
  }
  const updatedSponsor = {
    ...newSponsor,
    name,
    industry,
    contribution,
    teamId
  };
  try {
    await sponsorRepo.updateById(knex, sponsorId, updatedSponsor);
    return updatedSponsor;
  }catch(error){
    throw handleDBError(error);
  }
};

//CREATE
const create = async (knex: Knex,{sponsorId,name,industry,contribution,teamId}) => {
  const valid = validation.sponsorSchema.validate({sponsorId,name,industry,contribution,teamId});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }

  const team = await teamRepo.findById(knex, teamId);
  if (!team)
    throw new Error ('Team does not exist');
  try {
    const sponsor = await sponsorRepo.create(knex, {
      sponsorId,name,industry,contribution,teamId});
    return getById(knex, sponsorId);
  }catch (error) {
    throw handleDBError(error);
  }
};

//DELETE
const deleteById = async (knex: Knex, id: number) => {
  const sponsor = getById(knex, id);

  if (!sponsor) {
    throw new Error('Sponsor not found');
  }
  await sponsorRepo.deleteById(knex, id);
  return sponsor;
};

export default {getById, getByTeamId, getByName, getAll, getAllWithFinancials, getAllWithTeams, create, updateById, deleteById};
