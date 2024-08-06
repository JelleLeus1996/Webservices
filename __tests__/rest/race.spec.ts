import supertest from 'supertest';
import createServer from '../../src/createServer';
import { tables, getKnex } from '../../src/data';
import {Role} from '../../src/core/roles';
import { withServer, login, loginAdmin } from '../supertest.setup'; 
import {Race, Team} from '../../src/types/types'

const data =  {
  races: [      
    { raceId: 1, name: 'Omloop het Nieuwsblad', date: new Date('2024-02-25'), location: 'Belgium' },
    { raceId: 2, name: 'Tour de France', date: new Date('2024-07-01'), location: 'France' },
    { raceId: 3, name: "Giro d'Italia", date: new Date('2024-05-06'), location: 'Italy' },
  ] as Race[],
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
  races: [1, 2, 3],
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
 
  const url = '/api/races';
  describe('GET /api/races',()=>{

    beforeAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.race).whereIn('id', dataToDelete.races).delete();
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams);
      await knex(tables.race).insert(data.races);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.race).whereIn('id', dataToDelete.races).delete();
    });

    it('should return 200 and all races', async()=>{
      const response = await request.get(url).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2); //2 teams (Or body.count)
      expect(response.body.items[0]).toEqual({
       raceId: 1, name: 'Omloop het Nieuwsblad', date: new Date('2024-02-25'), location: 'Belgium'
      });
      expect(response.body.items[1]).toEqual({
       raceId: 2, name: 'Tour de France', date: new Date('2024-07-01'), location: 'France'
      });
    });
    it('should 400 when given an argument', async () => {
      const response = await request.get(`${url}?invalid=true`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');

      expect(response.statusCode).toBe(400);
      expect(response.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/races/:id',()=>{
    beforeAll(async()=>{
      //testdata toevoegen aan de db
      await knex(tables.team).insert(data.teams[0]);
      await knex(tables.race).insert(data.races);
    });
 
    afterAll(async()=>{
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.race).whereIn('id', dataToDelete.races).delete();
    });
    it('should return 200 and all races', async()=>{
      const response = await request.get(`${url}/1`).set('Authorization',authHeader).set('Accept', 'application/json');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        raceId: 1, name: 'Omloop het Nieuwsblad', date: new Date('2024-02-25'), location: 'Belgium'
      });
    });
  });
  it ('should 404 when requesting not existing race', async ()=> {
    const response = await request.get(`${url}/4`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      message:'No race with id 4 exists',
      details: {
        id: 4,
      },
           
    });
    expect (response.body.stack).toBeTruthy();
  });
 
  it ('should 400 with invalid race id', async ()=> {
    const response = await request.get(`${url}/invalid`).set('Authorization',authHeaderAdmin).set('Accept', 'application/json');
 
    expect(response.statusCode).toBe(400);
    expect(response.body.id).toBe(undefined);
    expect(response.body.details.params).toMatchObject(
      {
        'teamId': [{'message': '"raceId" must be a number', 'type': 'number.base'}]
      });
 
  });
  
  describe('POST /api/races', () => {
    const racesToDelete = [];
         
    //create some race data; no teams before, we will create it ourself
    beforeAll(async () => {

    });
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.race).whereIn('id', dataToDelete.races).delete();
    });
  
    it('should 201 and return the created race', async () => {
      const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
        .send({
            'raceId': 4, 'name': 'Dwars door Vlaanderen', 'date': new Date('2024-05-06'), 'location': 'België',
             'email': 'maarten.verbeek@hogent.be',
          'password': '12345678',
          'roles': 'ADMIN'
        });
      expect(response.status).toBe(201);
      expect(response.body.raceId).toBeTruthy();
      expect(response.body.country).toBe('Dwars door Vlaanderen');
      expect(response.body.date).toBe(new Date('2024-05-06'));
      expect(response.body.location).toBe('België');
      expect(response.body.mail).toBe('maarten.verbeek@hogent.be');
      expect(response.body.password).toBe('12345678');
      expect(response.body.roles).toBe('ADMIN');
      
      racesToDelete.push(response.body.id);
    });
  });
  it ('should 400 when name is not filled', async ()=> {
    const response = await request.post(url).set('Authorization',authHeaderAdmin).set('Accept', 'application/json')
      .send({
        'id':5,
        'date': new Date('2024-05-06'), 
        'location': 'België',
      });
    expect(response.statusCode).toBe(404);
    expect(response.body).toMatchObject({
      id:'NOT_FOUND',
      message:'No name is given',
      details: {
        id: 5,
      },
             
    });
    expect (response.body.stack).toBeTruthy();
  });
  describe ('DELETE /api/races/:id',() =>{
    //Create races & teams
    beforeAll(async()=>{
      await knex(tables.team).insert(data.teams);
    });
         
    afterAll(async () => {
      await knex(tables.team).whereIn('teamId', dataToDelete.teams).delete();
      await knex(tables.race).whereIn('raceId', dataToDelete.races).delete();
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
        message:'No race with id 37 exists',
        details: {
          id: 37,
        },
      });
    });
  });
});
