import supertest from 'supertest';
import createServer from '../../src/createServer';
import { tables, getKnex } from '../../src/data';
import {Role} from '../../src/core/roles';
import { withServer, login, loginAdmin } from '../supertest.setup'; 
import {Rider, Team} from '../../src/types/types'

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
    email: 'Magnus.Bäcksted@hotmail.com', 
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
  let server;
  let request;
  let knex;
  let authHeader;
  let authHeaderAdmin;
  //before all tests
  /*  withServer(({supertest,knex:k})=>
  {
    request=supertest;
    knex=k;
  }); */
  beforeAll(async ()=>{
    server = await createServer();
    request = supertest(server.getApp().callback());
    knex = getKnex();
    authHeader = await login(request);
    authHeaderAdmin = await loginAdmin(request);
  });
  afterAll(async () => {
    await server.stop();
  });
 
  const url = '/api/teams';
  describe('GET /api/teams',()=>{

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

    it('should return 200 and all teams', async()=>{
      const response = await request.get(url).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2); //2 teams (Or body.count)
      expect(response.body.items[0]).toEqual({
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
        email: 'Magnus.Bäcksted@hotmail.com', 
      });
      expect(response.body.items[1]).toEqual({
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
        email: 'jelle.leus@hogent.be',  
      });
    });
    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/teams/:id',()=>{
    beforeAll(async()=>{
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams[0]);
      await knex(tables.rider).insert(data.riders);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
    });
    it('should return 200 and all teams', async()=>{
      const response = await request.get(`${url}/1`).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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
        overhead_cost: '6500000.00', 
        email: 'Magnus.Bäcksted@hotmail.com', 
      });
    });
  });
  it ('should 404 when requesting not existing team', async ()=> {
    const response = await request.get(`${url}/3`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      message:'No team with id 3 exists',
      details: {
        id: 3,
      },
           
    });
    expect (response.body.stack).toBeTruthy();
  });
 
  it ('should 400 with invalid team id', async ()=> {
    const response = await request.get(`${url}/invalid`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(400);
    expect(response.body.id).toBe(undefined);
    expect(response.body.details.params).toMatchObject(
      {
        'teamId': [{'message': '"teamId" must be a number', 'type': 'number.base'}]
      });
 
  });
  
  describe('POST /api/teams', () => {
    const teamsToDelete = [];
         
    //create some rider data; no teams before, we will create it ourself
    beforeAll(async () => {

    });
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.rider).whereIn('id', dataToDelete.riders).delete();
    });
  
    it('should 201 and return the created team', async () => {
      const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
        .send({
          'teamId': 3, 'name':'Test Team 1', 'country':'Belgium', 'victories':44, 'points':5710,
          'team_status':'WTW', 'abbreviation':'TTT', 'director':'Frederik Verstraeten',
          'assistant':'Jan Bevers', 'representative':'Maarten Verbeeck', 'bike':'Trek',
          'overhead_cost':6500000.00, 'email': 'maarten.verbeeck@hogent.be',
          'password': '12345678',
          'roles': 'ADMIN'
        });
      expect(response.status).toBe(201);
      expect(response.body.id).toBeTruthy();
      expect(response.body.name).toBe('Test Team 1');
      expect(response.body.country).toBe('Belgium');
      expect(response.body.victories).toBe(44);
      expect(response.body.points).toBe(5710);
      expect(response.body.team_status).toBe('WTW');
      expect(response.body.abbreviation).toBe('TTT');
      expect(response.body.director).toBe('Frederik Verstraeten');
      expect(response.body.assistant).toBe('Jan Bevers');
      expect(response.body.representative).toBe('Maarten Verbeeck');
      expect(response.body.bike).toBe('Trek');
      expect(response.body.overhead_cost).toBe(6500000.00);
      expect(response.body.mail).toBe('maarten.verbeeck@hogent.be');
      expect(response.body.password).toBe('12345678');
      expect(response.body.roles).toBe('ADMIN');
      
      teamsToDelete.push(response.body.id);
    });
  });
  it ('should 400 when country is not filled', async ()=> {
    const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
      .send({
        'id':26,
        'name':'Canyon//SRAM Racing',
        'victories':8,
        'points':5710,
        'team_status':'WTW',
        'abbreviation':'CSR',
        'director':'Ronny Lauke',
        'assistant':'Beth Duryea',
        'representative':'Magnus Bäckstedt',
        'bike':'Canyon',
        'overhead_cost':6500000.00,
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      id:'NOT_FOUND',
      message:'No country is given',
      details: {
        id: 26,
      },
             
    });
    expect (response.body.stack).toBeTruthy();
  });
  describe ('DELETE /api/teams/:id',() =>{
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
        message:'No team with id 37 exists',
        details: {
          id: 37,
        },
      });
    });
  });
});
