import {requirePilotUser} from '../../../lib/server/pilot';
import {getChatGPTUser} from '../../chatgpt-auth';
import {readWorkspace} from '../../../lib/server/workspace';
import {photoBytes} from '../../../lib/server/ai';
import {errorResponse,AppError} from '../../../lib/server/runtime';
export async function GET(request:Request){try{const user=await requirePilotUser();if(!user)throw new AppError('Connexion requise.',401);const id=new URL(request.url).searchParams.get('id');const w=await readWorkspace(user.userId);const p=w.state.products.find(p=>p.id===id);if(!p)throw new AppError('Produit introuvable.',404);const image=await photoBytes(user.userId,p);return new Response(image.bytes,{headers:{'Content-Type':image.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return errorResponse(e);}}
