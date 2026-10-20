import {getDb} from '../../db';
import { integrations } from '../../db/schema';
import {eq,and} from 'drizzle-orm';
import {required,AppError} from './runtime';
import {encrypt,decrypt} from '../vault-crypto';
export async function seal(owner:string,provider:string,data:unknown){return encrypt(required('TOKEN_ENCRYPTION_KEY'),owner,provider,data);}
export async function unseal(owner:string,provider:string,value:string){try{return await decrypt(required('TOKEN_ENCRYPTION_KEY'),owner,provider,value);}catch{throw new AppError('La connexion doit être renouvelée.',401);}}
export async function putIntegration(owner:string,provider:string,token:unknown,metadata:Record<string,unknown>){const id=owner+':'+provider;const values={id,owner,provider,ciphertext:await seal(owner,provider,token),metadata:JSON.stringify(metadata),updatedAt:new Date().toISOString()};await getDb().insert(integrations).values(values).onConflictDoUpdate({target:integrations.id,set:values});}
export async function getIntegration(owner:string,provider:string){const [row]=await getDb().select().from(integrations).where(and(eq(integrations.owner,owner),eq(integrations.provider,provider)));if(!row)throw new AppError('Connectez d’abord le compte '+provider+'.',409);return {row,token:await unseal(owner,provider,row.ciphertext),metadata:JSON.parse(row.metadata)};}
