import supertest, { SuperTest, Test } from 'supertest';
import createServer from '../src/createServer'; // 👈 3
import { getKnex } from '../src/data'; // 👈 4


type SupertestInstance = SuperTest<Test>;

// Define the type for the setter function parameter in withServer
interface WithServerSetter {
  knex: ReturnType<typeof getKnex>;
  supertest: SupertestInstance;
}
// 👇 6
const login = async (supertest: SupertestInstance): Promise<string> => {
  // 👇 7
  const response = await supertest.post('/api/teams/login').send({
    email: 'Magnus.Bäckstedt@hotmail.com',
    password: '12345678',
  }).set('Accept', 'application/json');
 
  // 👇 8
  if (response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }
 
  return `Bearer ${response.body.token}`; // 👈 9
};
 
const loginAdmin = async (supertest: SupertestInstance): Promise<string> => {
  // 👇 7
  const response = await supertest.post('/api/teams/login').send({
    email: 'jelle.leus@student.hogent.be',
    password: '12345678',
  });
 
  // 👇 8
  if (response.statusCode !== 200) {
    throw new Error(response.body.message || 'Unknown error occured');
  }
 
  return `Bearer ${response.body.token}`; // 👈 9
};
 
// 👇 1
const withServer = (setter: (arg: WithServerSetter) => void): void => { // 👈 4
  let server; // 👈 2
 
  beforeAll(async () => {
    server = await createServer(); // 👈 3
 
    // 👇 4
    setter({
      knex: getKnex(),
      supertest: supertest(server.getApp().callback()),
    });
  });
 
  afterAll(async () => {
    await server.stop(); // 👈 5
  });
};
 
export {
  login,
  loginAdmin,
  withServer,
}; // 👈 1 en 6