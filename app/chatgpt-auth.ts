// Compatibility names for existing route imports. Identity now comes only from Supabase.
import {redirect} from 'next/navigation';
import {createClient} from '../lib/supabase/server';
export type ChatGPTUser={userId:string;displayName:string;email:string;fullName:string|null};
export async function getChatGPTUser():Promise<ChatGPTUser|null>{const supabase=await createClient();const {data:{user},error}=await supabase.auth.getUser();if(error||!user||!user.email||!user.email_confirmed_at)return null;return {userId:user.id,email:user.email,displayName:user.email,fullName:null};}
export function safeReturnTo(value:string){if(!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/';try{const u=new URL(value,'https://local.invalid');if(u.origin!=='https://local.invalid'||u.pathname.startsWith('/auth/')||u.pathname==='/login')return '/';return u.pathname+u.search;}catch{return '/';}}
export function chatGPTSignInPath(returnTo='/'){return '/login?next='+encodeURIComponent(safeReturnTo(returnTo));}
export async function requireChatGPTUser(returnTo='/'){const user=await getChatGPTUser();if(!user)redirect(chatGPTSignInPath(returnTo));return user;}
export function chatGPTSignOutPath(){return '/auth/signout';}
