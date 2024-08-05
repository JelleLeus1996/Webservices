import config from 'config'; 
import jwt from 'jsonwebtoken'; 
import {Team} from '../types/types';

const JWT_AUDIENCE: string = config.get('auth.jwt.audience'); 
const JWT_SECRET: string = config.get('auth.jwt.secret');
const JWT_ISSUER: string = config.get('auth.jwt.issuer'); 
const JWT_EXPIRATION_INTERVAL: number = config.get('auth.jwt.expirationInterval'); 

interface TokenData {
  teamId: number;
  roles: string;
}

interface SignOptions {
  expiresIn: number;
  audience: string;
  issuer: string;
  subject: string;
}
interface VerifyOptions {
  audience: string;
  issuer: string;
  subject: string;
}
export const generateJWT = (team: Team): Promise<string> => {
  //eigen claims
  const tokenData: TokenData = {
    teamId:team.teamId,
    roles:team.roles
  };

  //predifined claims
  const signOptions:SignOptions = {
    expiresIn:Math.floor(JWT_EXPIRATION_INTERVAL/1000),
    audience:JWT_AUDIENCE,
    issuer:JWT_ISSUER,
    subject:'auth'
  };
  return new Promise((resolve, reject) => {
    jwt.sign(tokenData, JWT_SECRET, signOptions, (error, token)=>{
      if (error) {
        console.log('Error while signing new token', error.message);
        return reject(error);
      }
      return resolve (token);
    });
  }
  );
};

export const verifyJWT = (authToken: string):Promise <TokenData> => {
  const verifyOptions = {
    audience:JWT_AUDIENCE,
    issuer:JWT_ISSUER,
    sub:'auth'
  };

  return new Promise((resolve, reject)=>{
    jwt.verify(authToken,JWT_SECRET, verifyOptions, (error, decodedToken)=> {
      if (error||!decodedToken){
        console.log('Error while verifying token', error.message);
        return reject(error||new Error('Token could not be parsed'));
      }
      return resolve(decodedToken);
    });
  });
};