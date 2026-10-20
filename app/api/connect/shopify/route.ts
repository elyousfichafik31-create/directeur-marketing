import {requirePilotUser} from '../../../../lib/server/pilot';
import {getChatGPTUser} from '../../../chatgpt-auth';
import {getDb} from '../../../../db';
import {oauthStates} from '../../../../db/schema';
import {required,baseUrl,json,errorResponse,sameOrigin,AppError} from '../../../../lib/server/runtime';
import {shopSchema} from '../../../../lib/security';
export async function POST(request:Request){try{const user=await requirePilotUser();if(!user)throw new AppError('Connexion requise.',401);sameOrigin(request);const input=await request.json() as {shop?:string};const shop=shopSchema.parse(input.shop);const id=required('SHOPIFY_CLIENT_ID');required('SHOPIFY_CLIENT_SECRET');required('TOKEN_ENCRYPTION_KEY');const state=crypto.randomUUID()+crypto.randomUUID();await getDb().insert(oauthStates).values({nonce:state,owner:user.userId,provider:'shopify',target:shop,expiresAt:Date.now()+600000});const url=new URL(`https://${shop}/admin/oauth/authorize`);url.search=new URLSearchParams({client_id:id,scope:'read_products',redirect_uri:baseUrl()+'/api/connect/shopify/callback',state}).toString();const r=json({url:url.toString()});r.headers.set('Set-Cookie',`__Host-marketmate-oauth=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);return r;}catch(e){return errorResponse(e);}}
