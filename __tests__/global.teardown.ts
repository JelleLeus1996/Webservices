import { shutdownData, getKnex, tables } from '../src/data'; // 👈 2 en 3
 
// 👇 1
export default async (): Promise<void> => {
  // Remove any leftover data
  await getKnex()(tables.rider).delete(); // 👈 2
  await getKnex()(tables.team).delete(); // 👈 2
 
  // Close database connection
  await shutdownData(); // 👈 3
};
 