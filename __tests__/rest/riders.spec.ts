import supertest from 'supertest';
import createServer from '../../src/createServer';
import { tables, getKnex } from '../../src/data';
import {Role} from '../../src/core/roles';
import {Rider, Team} from '../../src/types/types'
import { withServer, login, loginAdmin } from '../supertest.setup'; 
import {Knex} from 'knex';

const data =  {
  riders: [{
    id:1, nationality:'Poland', last_name:'Niewiadoma', first_name:'Katarzyna', birthday:new Date('1994-09-29'), points:10763, teamId:1, monthly_wage:50047.57 
  },
  { 
    id:2, nationality:'Australia', last_name:'Cromwell', first_name:'Tiffany', birthday:new Date('1988-07-06'), points:3604, teamId:1, monthly_wage:7192.01 
  },
  { 
    id:3, nationality:'Italy', last_name:'Paladin', first_name:'Soraya', birthday:new Date('1994-04-11'), points:3372, teamId:1, monthly_wage:6517.66 
  },
  ] as Rider[],
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
  riders: [1, 2, 3],
  teams: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]
};
describe('Teams', ()=>{
  let server: ReturnType<typeof createServer>;
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
 
  const url = '/api/riders';
  describe('GET /api/riders',()=>{

    beforeAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams);
      await knex(tables.rider).insert(data.riders);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
    });

    it('should return 200 and all riders', async()=>{
      const response = await request.get(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(3); //2 riders (Or body.count)
      expect(response.body.items[0]).toEqual({
        id:1, 
        nationality:'Poland', 
        last_name:'Niewiadoma', 
        first_name:'Katarzyna', 
        birthday:'1994-09-29', 
        points:10763, 
        teamId:1,
      });
      expect(response.body.items[1]).toEqual({
        id:2, nationality:'Australia', last_name:'Cromwell', first_name:'Tiffany', birthday:'1988-07-06', points:3604, teamId:1
      });
      expect(response.body.items[2]).toEqual({
        id:3, nationality:'Italy', last_name:'Paladin', first_name:'Soraya', birthday:'1994-04-11', points:3372, teamId:1
      });
    });
    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/riders/:id',()=>{
    beforeAll(async()=>{
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams);
      await knex(tables.rider).insert(data.riders[0]);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
    });
    it('should return 200 and 1 rider', async()=>{
      const response = await request.get(`${url}/1`).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id:1, nationality:'Poland', last_name:'Niewiadoma', first_name:'Katarzyna', birthday:'1994-09-29', points:10763, teamId:1, monthly_wage:50047.57 
      });
    });
  });
  it ('should 404 when requesting not existing rider', async ()=> {
    const response = await request.get(`${url}/8`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      message:'No rider with id 8 exists',
      details: {
        id: 8,
      },
           
    });
    expect (response.body.stack).toBeTruthy();
  });
 
  it ('should 400 with invalid rider id', async ()=> {
    const response = await request.get(`${url}/invalid`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(400);
    expect(response.body.id).toBe(undefined);
    expect(response.body.details.params).toMatchObject(
      {
        'teamId': [{'message': '"id" must be a number', 'type': 'number.base'}]
      });
 
  });
  
  describe('POST /api/riders', () => {
    const ridersToDelete = [];
         
    //create some rider data; no riders before, we will create it ourself
    beforeAll(async () => {

    });
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
    });
  
    it('should 201 and return the created rider', async () => {
      const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
        .send({
          'id':350, 
          'nationality':'Belgium', 
          'last_name':'Poppe', 
          'first_name':'Febe', 
          'birthday':'2000-07-14', 
          'points':0, 
          'teamId':1, 
          'monthly_wage':500.00 
        });
      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.nationality).toBe('Belgium');
      expect(response.body.last_name).toBe('Poppe');
      expect(response.body.first_name).toBe('Febe');
      expect(response.body.points).toBe(0);
      expect(response.body.birthday).toBe('2000-07-14');
      expect(response.body.teamId).toBe('1');
      expect(response.body.monthly_wage).toBe(500.00);
      expect(response.body.rider_cost).toBe(1177803.13);
      
      ridersToDelete.push(response.body.id);
    });
  });
  it ('should 400 when nationality is not filled', async ()=> {
    const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
      .send({
        'id':350, 
        'last_name':'Poppe', 
        'first_name':'Febe', 
        'birthday':'2000-07-14', 
        'points':0, 
        'teamId':1, 
        'monthly_wage':500.00 
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      id:'NOT_FOUND',
      message:'No nationality is given',
      details: {
        id: 350,
      },
             
    });
    expect (response.body.stack).toBeTruthy();
  });
  describe ('DELETE /api/riders/:id',() =>{
    //Create riders & teams
    beforeAll(async()=>{
      await knex(tables.team).insert(data.teams);
    });
         
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
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
        message:'No rider with id 37 exists',
        details: {
          id: 37,
        },
      });
    });
  }); 
});
