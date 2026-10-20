import {getChatGPTUser} from '../../../chatgpt-auth';
import {getDb} from '../../../../db';
import {assets} from '../../../../db/schema';
import {eq,and} from 'drizzle-orm';
import {mediaStorage,storageReady} from '../../../../lib/server/storage';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const user=await getChatGPTUser();if(!user)return new Response('Connexion requise',{status:401});const {id}=await params;const [asset]=await getDb().select().from(assets).where(and(eq(assets.id,id),eq(assets.owner,user.userId)));if(!asset||!storageReady())return new Response('Média introuvable',{status:404});const object=await mediaStorage.get(asset.objectKey);if(!object)return new Response('Média introuvable',{status:404});return new Response(object.body,{headers:{'Content-Type':asset.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
