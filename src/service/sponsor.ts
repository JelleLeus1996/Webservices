import teamRepo from '../repository/team';
import sponsorRepo from '../repository/sponsor';
import validation from '../schema/sponsorSchema';

import handleDBError from './_handleDBError';

//GET sponsor by id
const getById = async (id: number) => {
  const sponsor = await sponsorRepo.findById(id);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with id ${id}`, {id});
  }
  return sponsor;
};

//GET sponsors by teamId
const getByTeamId = async (id: number) => {
  const sponsor = await sponsorRepo.findAllFromTeam(id);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with id ${id}`, {id});
  }
  return sponsor;
};
  
//GET sponsor by teamId
const getByName = async (name: string) => {
  const sponsor = await sponsorRepo.findByName(name);
  if (!sponsor)
  {
    throw Error(`There is no sponsor with the name ${name}`, {name});
  }
  return sponsor;
};

const getAll = async () => {
  const sponsors = await sponsorRepo.findAllSponsorsNonFinancial();
  return { items: sponsors, count:sponsors.length };
};

const getAllWithFinancials = async () => {
  const sponsors = await sponsorRepo.findAllSponsorsWithFinancial();
  return { items: sponsors, count:sponsors.length };
};

const getAllWithTeams = async() => {
  const sponsors = await sponsorRepo.findAllWithTeam();
  return { items: sponsors, count:sponsors.length};
};

//UPDATE
let newSponsor = [];
const updateById = async (sponsorId, {name,industry,contribution,teamId}) =>
{
  const valid = validation.sponsorSchema.validate({sponsorId,name,industry,contribution,teamId});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }
  //Check if the sponsor exists
  const existing = await sponsorRepo.findById(sponsorId);
  if (!existing)
  {
    throw new Error('Sponsor doesn\'t exist');
  }
  //Check team
  const team = await teamRepo.findById(teamId);
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
    await sponsorRepo.updateById(sponsorId, updatedSponsor);
    return updatedSponsor;
  }catch(error){
    throw handleDBError(error);
  }
};

//CREATE
const create = async ({sponsorId,name,industry,contribution,teamId}) => {
  const valid = validation.sponsorSchema.validate({sponsorId,name,industry,contribution,teamId});
  if (valid.error)
  {
    throw new Error(valid.error.details[0].message);
  }

  const team = await teamRepo.findById(t=>t.teamId===teamId);
  if (!team)
    throw new Error ('Team does not exist');
  try {
    const sponsor = await sponsorRepo.create({
      sponsorId,name,industry,contribution,teamId});
    return getById(sponsor);
  }catch (error) {
    throw handleDBError(error);
  }
};

//DELETE
const deleteById = async (id: number) => {
  const sponsor = getById(id);

  if (!sponsor) {
    throw new Error('Sponsor not found');
  }
  await sponsorRepo.deleteById(id);
  return sponsor;
};

export default {getById, getByTeamId, getByName, getAll, getAllWithFinancials, getAllWithTeams, create, updateById, deleteById};
