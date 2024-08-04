import createServer from'./createServer';

async function main(): Promise<void> {
  try {
    const server = await createServer();
    await server.start();
    
    async function onClose(): Promise<void> {
      await server.stop();
      process.exit(0);
    }

    process.on('SIGTERM',onClose);//signal terminate
    process.on('SIGQUIT',onClose);//signal quit

  }catch (error){
    console.error(error);
    process.exit(-1);

  }
}
main();
