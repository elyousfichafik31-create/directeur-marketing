import {getChatGPTUser} from '../../chatgpt-auth';
import {z} from 'zod';
import {workspaceSchema,validateRelations} from '../../../lib/model';
import {readWorkspace,commitWorkspace} from '../../../lib/server/workspace';
import {AppError,json,errorResponse,sameOrigin} from '../../../lib/server/runtime';
import {boundedBytes} from '../../../lib/provider-http';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await getChatGPTUser();if(!user)throw new AppError('Connexion requise.',401);return json(await readWorkspace(user.userId));}catch(e){return errorResponse(e);}}
export async function PUT(request:Request){try{const user=await getChatGPTUser();if(!user)throw new AppError('Connexion requise.',401);sameOrigin(request);const bytes=await boundedBytes(request.body,1000000);let raw:unknown;try{raw=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new AppError('Requête JSON invalide.');}const input=z.object({revision:z.number().int().min(0),state:workspaceSchema,action:z.string().min(2).max(200)}).parse(raw);try{validateRelations(input.state);}catch(e){throw new AppError((e as Error).message);}return json(await commitWorkspace(user.userId,input.revision,input.state,input.action));}catch(e){if(e instanceof z.ZodError)return json({error:'Données invalides. Vérifiez les champs.'},400);return errorResponse(e);}}
