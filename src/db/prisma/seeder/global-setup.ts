import { config } from 'dotenv';
import { resolve } from 'path';
import seed from './main';

config({ path: resolve(__dirname, '../../../../.env.test') });

export default async function globalSetup(): Promise<void> {
  await seed();
}
