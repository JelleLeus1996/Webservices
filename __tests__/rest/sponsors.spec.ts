import supertest from 'supertest';
import createServer from '../../src/createServer';
import { tables, getKnex } from '../../src/data';
import {Role} from '../../src/core/roles';
import {Sponsor, Team} from '../../src/types/types'
import { withServer, login, loginAdmin } from '../supertest.setup'; 
import {Knex} from 'knex';
import sponsor from '../../src/repository/sponsor';

const data =  {
  sponsors: [
    { sponsorId: 1, name: 'Canyon', industry: 'Bicycle', contribution: 4500000, teamId: 1 },
    { sponsorId: 2, name: 'SRAM', industry: 'Bicycle Components', contribution: 4000000, teamId: 1 },
    // EF Education TIBCO SVB
    { sponsorId: 3, name: 'EF Education', industry: 'Education', contribution: 4500000, teamId: 2 },
  ] as Sponsor[],
  teams: [{
    teamId:1,
    name:'CyclingTeam 1', 
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
    roles: JSON.stringify([Role.TEAMREPRESENTATIVE])},
  { 
    teamId:2, 
    name:'CyclingTeam 2',
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
    email: 'jelle.leus@hogent.be',
    password_hash: '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4',
    roles: JSON.stringify([Role.TEAMREPRESENTATIVE,Role.ADMIN])}
  ] as Team[],
};

const dataToDelete = {
  sponsors: [1, 2, 3],
  teams: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]
};
describe('Teams', ()=>{
  let server: ReturnType<any>;
  let request: supertest.SuperTest<supertest.Test>;
  let knex: Knex;
  let authHeader: string;
  let authHeaderAdmin: string;
  //before all tests
  /*  withServer(({supertest,knex:k})=>
  {
    request=supertest;
    knex=k;
  }); */
  beforeAll(async () => {
    const app = await createServer();
    server = app.start();
    request = supertest(server);
    knex = getKnex();
    authHeader = await login(request);
    authHeaderAdmin = await loginAdmin(request);
  });

  afterAll(async () => {
    server.close();
  });
 
  const url = '/api/sponsors';
  describe('GET /api/sponsors',()=>{

    beforeAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.sponsor).whereIn('id', dataToDelete.sponsors).delete();
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams);
      await knex(tables.sponsor).insert(data.sponsors);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.sponsor).whereIn('id', dataToDelete.sponsors).delete();
    });

    it('should return 200 and all sponsors', async()=>{
      const response = await request.get(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3); //2 sponsors (Or body.count)
      expect(response.body.items[0]).toEqual({
        sponsorId: 1, name: 'Canyon', industry: 'Bicycle', contribution: 4500000, teamId: 1
      });
      expect(response.body.items[1]).toEqual({
        sponsorId: 2, name: 'SRAM', industry: 'Bicycle Components', contribution: 4000000, teamId: 1
      });
      expect(response.body.items[2]).toEqual({
        sponsorId: 3, name: 'EF Education', industry: 'Education', contribution: 4500000, teamId: 2
      });
    });
    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/sponsors/:id',()=>{
    beforeAll(async()=>{
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams);
      await knex(tables.sponsor).insert(data.sponsors[0]);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.sponsor).whereIn('id', dataToDelete.sponsors).delete();
    });
    it('should return 200 and 1 sponsor', async()=>{
      const response = await request.get(`${url}/1`).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        sponsorId: 1, name: 'Canyon', industry: 'Bicycle', contribution: 4500000, teamId: 1
      });
    });
  });
  it ('should 404 when requesting not existing sponsor', async ()=> {
    const response = await request.get(`${url}/8`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      message:'No sponsor with id 8 exists',
      details: {
        id: 8,
      },
           
    });
    expect (response.body.stack).toBeTruthy();
  });
 
  it ('should 400 with invalid sponsor id', async ()=> {
    const response = await request.get(`${url}/invalid`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(400);
    expect(response.body.id).toBe(undefined);
    expect(response.body.details.params).toMatchObject(
      {
        'teamId': [{'message': '"id" must be a number', 'type': 'number.base'}]
      });
 
  });
  
  describe('POST /api/sponsors', () => {
    const sponsorsToDelete = [];
         
    //create some sponsor data; no sponsors before, we will create it ourself
    beforeAll(async () => {

    });
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.sponsor).whereIn('id', dataToDelete.sponsors).delete();
    });
  
    it('should 201 and return the created sponsor', async () => {
      const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
        .send({
          'sponsorId':25, 
          'name':'EY Belgium', 
          'industry':'consultancy', 
          'contribution':7500000, 
        });
      expect(response.status).toBe(201);
      expect(response.body.sponsorId).toBeTruthy();
      expect(response.body.name).toBe('EY Belgium');
      expect(response.body.industry).toBe('consultancy');
      expect(response.body.contribution).toBe(7500000);      
      sponsorsToDelete.push(response.body.sponsorId);
    });
  });
  it ('should 400 when name is not filled', async ()=> {
    const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
      .send({
        'sponsorId':25, 
        'industry':'consultancy', 
        'contribution':7500000, 
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      id:'NOT_FOUND',
      message:'No name is given',
      details: {
        id: 25,
      },
             
    });
    expect (response.body.stack).toBeTruthy();
  });
  describe ('DELETE /api/sponsors/:id',() =>{
    //Create sponsors & teams
    beforeAll(async()=>{
      await knex(tables.team).insert(data.teams);
    });
         
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.sponsor).whereIn('id', dataToDelete.sponsors).delete();
    });
         
    it('should 204 and return nothing', async ()=>{
      const response = await request.delete(`${url}/1`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
    
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
    });
  
    //check if you retrieve a 404 error if a team that doesn't exist is passed
    it ('should 404 when given an argument', async () => {
      const response = await request.delete(`${url}/37`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
    
      expect(response.statusCode).toBe(404);
      expect(response.body).toMatchObject({
        message:'No sponsor with id 37 exists',
        details: {
          id: 37,
        },
      });
    });
  }); 
});
