import {requirePilotUser} from '../../../../lib/server/pilot';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {getDb} from '../../../../db';
import {oauthStates} from '../../../../db/schema';
import {required,baseUrl,json,errorResponse,sameOrigin,AppError} from '../../../../lib/server/runtime';
import {graphVersion} from '../../../../lib/server/meta';
export async function POST(request:Request){try{const user=await requirePilotUser();if(!user)throw new AppError('Connexion requise.',401);sameOrigin(request);const id=required('META_APP_ID');required('META_APP_SECRET');required('TOKEN_ENCRYPTION_KEY');const state=crypto.randomUUID()+crypto.randomUUID();await getDb().insert(oauthStates).values({nonce:state,owner:user.userId,provider:'meta',target:'meta',expiresAt:Date.now()+600000});const url=new URL(`https://www.facebook.com/${graphVersion()}/dialog/oauth`);url.search=new URLSearchParams({client_id:id,redirect_uri:baseUrl()+'/api/connect/meta/callback',state,response_type:'code',scope:'pages_show_list,pages_read_engagement,instagram_basic,instagram_content_publish,ads_read,ads_management'}).toString();const r=json({url:url.toString()});r.headers.set('Set-Cookie',`__Host-marketmate-meta=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);return r;}catch(e){return errorResponse(e);}}
