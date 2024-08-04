import { generateJWT, verifyJWT } from './core/jwt';
import {Team} from './types/types'

function messWithPayload(jwt) {
  const [header, payload, signature] = jwt.split('.');
  const parsedPayload = JSON.parse(
    Buffer.from(payload, 'base64url').toString() //convert base64url to text (string)
  );

  // make me admin 
  if (Array.isArray(parsedPayload.roles)) {
    parsedPayload.roles.push('admin');
  } else {
    parsedPayload.roles = ['admin'];
  }

  const newPayload = Buffer.from(
    JSON.stringify(parsedPayload),
    'ascii'
  ).toString('base64url');
  return [header, newPayload, signature].join('.');
}

async function main():Promise<void> {
  const fakeTeam :Team = {
    teamId:1, 
    name:'Canyon//SRAM Racing',
    country:'Germany', 
    victories:8, 'points':5710, 
    team_status:'WTW', 
    abbreviation:'CSR', 
    director:'Ronny Lauke', 
    assistant:'Beth Duryea',
    representative:'Magnus Bäckstedt',
    bike:'Canyon',
    overhead_cost:6500000.00, 
    email: 'Magnus.Bäckstedt@hotmail.com', 
    password_hash: '$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4', 
    roles: JSON.stringify(['team','admin'])
  };

  const jwt = await generateJWT(fakeTeam);
  // copy and paste the JWT in the textfield on https://jwt.io
  // inspect the content
  console.log('The JWT:', jwt);

  let valid = await verifyJWT(jwt);
  console.log('This JWT is', valid ? 'valid' : 'incorrect');

  // Let's mess with the payload
  const messedUpJwt = messWithPayload(jwt);
  console.log('Messed up JWT:', messedUpJwt);

  console.log('Verifying this JWT will throw an error:');
  try{
    valid = await verifyJWT(messedUpJwt);
  } catch(error)
  {
    console.error('Error verifying JWT:',error);
  }
  
}

main();
