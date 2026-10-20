import 'server-only';
import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import * as schema from './schema';
let client:ReturnType<typeof postgres>|undefined;
export function getDb(){const url=process.env.DATABASE_URL;if(!url)throw Error('Configurez DATABASE_URL dans Netlify.');client??=postgres(url,{prepare:false,max:1,idle_timeout:20,connect_timeout:15,ssl:'require'});return drizzle(client,{schema});}
