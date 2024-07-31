module.exports={
  logging : {
    level:'info', //logging until level (3 - info)
    disabled: false
  },//add configurations of cors: webapplication will render on 5173 and maxAge is the time that it will have access (is in seconds, so 3hours here)
  cors: { // 👈 1
    origins: ['http://localhost:5173'], // 👈 2
    maxAge: 3 * 60 * 60, // 👈 3
  },
  database: {
    client: 'mysql2',
    host: 'localhost',
    port: 3306,
    name: 'cyclingDatabase',
    username: 'root',
    password: '',
  },
  auth: {
    argon: {
      saltLength: 16,
      hashLength: 32,
      timeCost: 6,
      memoryCost: 2 ** 17,
    },
    jwt: {
      secret: 'eenveeltemoeilijksecretdatniemandooitzalradenandersisdesitegehacked',
      expirationInterval: 60 * 60 * 1000, // ms (1 hour) dependent on the secutity needs of the app. Bank app shorter
      issuer: 'cyclingdb.hogent.be',
      audience: 'cyclingdb.hogent.be',
    },
  },
};