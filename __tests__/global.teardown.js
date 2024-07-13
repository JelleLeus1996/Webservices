const { shutdownData, getKnex, tables } = require('../src/data'); // 👈 2 en 3
 
// 👇 1
module.exports = async () => {
  // Remove any leftover data
  await getKnex()(tables.rider).delete(); // 👈 2
  await getKnex()(tables.team).delete(); // 👈 2
 
  // Close database connection
  await shutdownData(); // 👈 3
};
 